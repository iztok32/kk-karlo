import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/Components/ui/context-menu';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/tooltip';
import { useForm, Head, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  User,
  Trash2,
  Plus,
  AlertCircle,
  Bell,
  Mail,
  MessageSquare,
  Send,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import {
  format,
  parseISO,
  isToday,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isBefore,
  isAfter,
  isSameDay,
} from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Appointment {
  id: number;
  name: string;
  valid_from: string | null;
  valid_to: string | null;
  day_monday: boolean;
  day_tuesday: boolean;
  day_wednesday: boolean;
  day_thursday: boolean;
  day_friday: boolean;
  day_saturday: boolean;
  day_sunday: boolean;
  start_time: string | null;
  end_time: string | null;
  capacity: number | null;
  is_active: boolean;
}

interface Reservation {
  id: number;
  appointment_id: number;
  horse_id: number;
  user_id: number;
  reservation_date: string;
  notes: string | null;
  horse: { id: number; name: string };
  user: { id: number; name: string };
}

interface ReservationWithAppointment extends Reservation {
  appointment: Appointment;
}

interface HorseItem {
  id: number;
  name: string;
}

interface UserItem {
  id: number;
  name: string;
}

interface ReservationLimits {
  minDaysInAdvance: number;
  maxDaysInAdvance: number | null;
  isAdmin: boolean;
}

interface Props {
  appointments: Appointment[];
  reservations: Reservation[];
  horses: HorseItem[];
  users: UserItem[];
  canReserveForOthers: boolean;
  startDate: string;
  endDate: string;
  currentView: string;
  authUserId: number;
  myUpcoming: ReservationWithAppointment[];
  reservationLimits: ReservationLimits;
  canNotifySlots: boolean;
  myTeacherAppointmentIds: number[];
  enabledChannels: ('portal' | 'email' | 'sms')[];
}

interface NotifySlot {
  appointment: Appointment;
  date: Date;
  channel: 'portal' | 'email' | 'sms';
  recipientIds: number[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_KEYS: (keyof Appointment)[] = [
  'day_sunday',
  'day_monday',
  'day_tuesday',
  'day_wednesday',
  'day_thursday',
  'day_friday',
  'day_saturday',
];

const LOCALE_MAP: Record<string, Locale> = { sl, en: enGB, hr, it, de };

function appointmentOnDate(appt: Appointment, date: Date): boolean {
  const dayKey = DAY_KEYS[date.getDay()];
  if (!appt[dayKey]) return false;

  if (appt.valid_from) {
    const vf = parseISO(appt.valid_from);
    if (isBefore(date, vf)) return false;
  }
  if (appt.valid_to) {
    const vt = parseISO(appt.valid_to);
    if (isAfter(date, vt)) return false;
  }
  return true;
}

function formatTime(time: string | null): string {
  if (!time) return '';
  return time.substring(0, 5); // "09:00:00" → "09:00"
}

function getDateRange(date: Date, viewType: string): { start: string; end: string } {
  if (viewType === 'week') {
    return {
      start: format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      end: format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    };
  }
  if (viewType === 'day') {
    const d = format(date, 'yyyy-MM-dd');
    return { start: d, end: d };
  }
  // default: month — use full grid range (incl. adjacent-month days shown in calendar)
  return {
    start: format(startOfWeek(startOfMonth(date), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(endOfMonth(date), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  };
}

// ─── Slot Chip ────────────────────────────────────────────────────────────────

interface SlotChipProps {
  appointment: Appointment;
  date: Date;
  reservations: Reservation[];
  authUserId: number;
  onClick: () => void;
  compact?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  isTeacherSlot?: boolean;
  canNotify?: boolean;
  enabledChannels?: ('portal' | 'email' | 'sms')[];
  onNotify?: (channel: 'portal' | 'email' | 'sms') => void;
}

function SlotChip({ appointment, date, reservations, authUserId, onClick, compact = false, disabled = false, disabledReason, isTeacherSlot = false, canNotify = false, enabledChannels = [], onNotify }: SlotChipProps) {
  const count = reservations.length;
  const capacity = appointment.capacity;
  const isFull = capacity !== null && count >= capacity;
  const isNearFull = capacity !== null && count / capacity >= 0.7;
  const userHasReservation = reservations.some((r) => r.user_id === authUserId);
  const isDisabled = disabled || (isFull && !userHasReservation);

  const colorClass = disabled
    ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-70'
    : isTeacherSlot
    ? isFull
      ? 'bg-purple-100 text-purple-700 border-purple-300 opacity-80'
      : isNearFull
      ? 'bg-purple-100 text-purple-700 border-purple-300'
      : 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'
    : isFull
    ? 'bg-red-100 text-red-700 border-red-200 opacity-80'
    : isNearFull
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';

  const label = capacity !== null ? (isFull ? 'POLNO' : `${count}/${capacity}`) : `${count}`;

  const chipButton = compact ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={isDisabled ? undefined : onClick}
          className={cn(
            'w-full text-left text-xs px-1.5 py-0.5 rounded border',
            colorClass,
            isDisabled ? 'cursor-default' : 'cursor-pointer',
          )}
        >
          <div className="flex items-center gap-1 truncate">
            {appointment.start_time && (
              <span className="font-medium shrink-0">{formatTime(appointment.start_time)}</span>
            )}
            <span className="truncate">{appointment.name}</span>
            <span className="font-semibold shrink-0">{label}</span>
            {userHasReservation && <span className="shrink-0">✓</span>}
            {isTeacherSlot && <span className="shrink-0 opacity-60">★</span>}
          </div>
          {reservations.length > 0 && (
            <div className="flex flex-wrap gap-x-1 mt-0.5">
              {reservations.map((r) => (
                <span key={r.id} className="truncate opacity-80">🐴 {r.horse.name}</span>
              ))}
            </div>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{appointment.name}</p>
        {appointment.start_time && (
          <p className="text-xs opacity-75">
            {formatTime(appointment.start_time)}
            {appointment.end_time && ` – ${formatTime(appointment.end_time)}`}
          </p>
        )}
        <p className="text-xs">
          {isFull ? 'Polno zasedeno' : `${count} / ${capacity ?? '∞'} rezervacij`}
        </p>
        {reservations.map((r) => (
          <p key={r.id} className="text-xs">🐴 {r.horse.name}</p>
        ))}
        {userHasReservation && <p className="text-xs font-medium">✓ Imate rezervacijo</p>}
        {isTeacherSlot && <p className="text-xs opacity-70">★ Vaš termin</p>}
        {disabledReason && <p className="text-xs text-amber-300 mt-1">⚠ {disabledReason}</p>}
      </TooltipContent>
    </Tooltip>
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={isDisabled ? undefined : onClick}
          className={cn(
            'w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors',
            colorClass,
            isDisabled ? 'cursor-default' : 'cursor-pointer',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {appointment.start_time && (
                <span className="flex items-center gap-1 font-semibold whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(appointment.start_time)}
                  {appointment.end_time && ` – ${formatTime(appointment.end_time)}`}
                </span>
              )}
              <span className="font-medium truncate">{appointment.name}</span>
              {isTeacherSlot && <span className="text-xs opacity-60">★</span>}
            </div>
            <span className="font-bold whitespace-nowrap text-xs">
              {isFull ? 'POLNO' : `${count} / ${capacity ?? '∞'}`}
              {userHasReservation && ' ✓'}
            </span>
          </div>
          {reservations.length > 0 && (
            <div className="flex flex-wrap gap-x-3 mt-1.5">
              {reservations.map((r) => (
                <span key={r.id} className="text-xs opacity-80">🐴 {r.horse.name}</span>
              ))}
            </div>
          )}
        </button>
      </TooltipTrigger>
      {disabledReason && (
        <TooltipContent>
          <p className="text-xs">⚠ {disabledReason}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );

  if (!canNotify || enabledChannels.length === 0) return chipButton;

  return (
    <ContextMenu>
      <ContextMenuTrigger>{chipButton}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel className="text-xs text-muted-foreground">
          {appointment.name} · {count} {count === 1 ? 'rezervacija' : 'rezervacij'}
        </ContextMenuLabel>
        <ContextMenuSeparator />
        {enabledChannels.includes('portal') && (
          <ContextMenuItem onClick={() => onNotify?.('portal')}>
            <Bell className="mr-2 h-4 w-4" />
            Pošlji portalno obvestilo
          </ContextMenuItem>
        )}
        {enabledChannels.includes('email') && (
          <ContextMenuItem onClick={() => onNotify?.('email')}>
            <Mail className="mr-2 h-4 w-4" />
            Pošlji e-mail
          </ContextMenuItem>
        )}
        {enabledChannels.includes('sms') && (
          <ContextMenuItem onClick={() => onNotify?.('sms')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Pošlji SMS
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Index({
  appointments,
  reservations,
  horses,
  users,
  canReserveForOthers,
  startDate,
  endDate,
  currentView,
  authUserId,
  myUpcoming,
  reservationLimits = { minDaysInAdvance: 0, maxDaysInAdvance: null, isAdmin: false },
  canNotifySlots = false,
  myTeacherAppointmentIds = [],
  enabledChannels = [],
}: Props) {
  const { t, locale } = useTranslation();
  const dateFnsLocale = LOCALE_MAP[locale] ?? sl;

  const [view, setView] = useState<'month' | 'week' | 'day'>(
    (currentView as 'month' | 'week' | 'day') || 'month',
  );

  // Anchor date for the calendar (first day of current period)
  const [anchorDate, setAnchorDate] = useState<Date>(() => parseISO(startDate));

  // Selected slot for reservation dialog
  const [selectedSlot, setSelectedSlot] = useState<{
    appointment: Appointment;
    date: Date;
  } | null>(null);

  // Reservation form
  const { data, setData, post, errors, processing, reset, clearErrors } = useForm<{
    appointment_id: number;
    horse_id: string;
    user_id: string;
    reservation_date: string;
    notes: string;
  }>({
    appointment_id: 0,
    horse_id: '',
    user_id: String(authUserId),
    reservation_date: '',
    notes: '',
  });

  // ── Notify slot dialog state ────────────────────────────────────────────────
  const [notifySlot, setNotifySlot] = useState<NotifySlot | null>(null);

  const { data: notifyData, setData: setNotifyData, post: postNotify, processing: notifyProcessing, reset: resetNotify, errors: notifyErrors } = useForm({
    subject: '',
    message: '',
    recipient_ids: [] as number[],
    send_to_all: false,
  });

  // ── Computed calendar days ──────────────────────────────────────────────────

  const calendarDays = useMemo<Date[]>(() => {
    if (view === 'week') {
      const ws = startOfWeek(anchorDate, { weekStartsOn: 1 });
      const we = endOfWeek(anchorDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: ws, end: we });
    }
    if (view === 'day') {
      return [anchorDate];
    }
    // month
    const ms = startOfWeek(startOfMonth(anchorDate), { weekStartsOn: 1 });
    const me = endOfWeek(endOfMonth(anchorDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: ms, end: me });
  }, [anchorDate, view]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function getSlotReservations(appointmentId: number, date: Date): Reservation[] {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations.filter(
      (r) => r.appointment_id === appointmentId && r.reservation_date.slice(0, 10) === dateStr,
    );
  }

  function getAppointmentsForDay(date: Date): Appointment[] {
    return appointments.filter((a) => appointmentOnDate(a, date));
  }

  // Always derived live from props so it refreshes after every POST
  const selectedSlotReservations: Reservation[] = selectedSlot
    ? getSlotReservations(selectedSlot.appointment.id, selectedSlot.date)
    : [];

  // ── Navigation ──────────────────────────────────────────────────────────────

  function navigate(direction: 'prev' | 'next') {
    let newDate: Date;
    if (view === 'month') {
      newDate = direction === 'prev' ? subMonths(anchorDate, 1) : addMonths(anchorDate, 1);
      newDate = startOfMonth(newDate);
    } else if (view === 'week') {
      newDate = direction === 'prev' ? subWeeks(anchorDate, 1) : addWeeks(anchorDate, 1);
    } else {
      newDate = direction === 'prev' ? subDays(anchorDate, 1) : addDays(anchorDate, 1);
    }
    setAnchorDate(newDate);
    const { start, end } = getDateRange(newDate, view);
    router.get(
      route('reservations.index'),
      { start, end, view },
      { preserveState: true, preserveScroll: true },
    );
  }

  function goToToday() {
    const today = new Date();
    setAnchorDate(today);
    const { start, end } = getDateRange(today, view);
    router.get(
      route('reservations.index'),
      { start, end, view },
      { preserveState: true, preserveScroll: true },
    );
  }

  function switchView(newView: 'month' | 'week' | 'day') {
    setView(newView);
    const { start, end } = getDateRange(anchorDate, newView);
    router.get(
      route('reservations.index'),
      { start, end, view: newView },
      { preserveState: true, preserveScroll: true },
    );
  }

  // ── Period label ────────────────────────────────────────────────────────────

  const periodLabel = useMemo(() => {
    if (view === 'month') {
      return format(anchorDate, 'LLLL yyyy', { locale: dateFnsLocale });
    }
    if (view === 'week') {
      const ws = startOfWeek(anchorDate, { weekStartsOn: 1 });
      const we = endOfWeek(anchorDate, { weekStartsOn: 1 });
      if (ws.getMonth() === we.getMonth()) {
        return `${format(ws, 'd')} – ${format(we, 'd. MMMM yyyy', { locale: dateFnsLocale })}`;
      }
      return `${format(ws, 'd. MMM', { locale: dateFnsLocale })} – ${format(we, 'd. MMM yyyy', { locale: dateFnsLocale })}`;
    }
    return format(anchorDate, 'EEEE, d. MMMM yyyy', { locale: dateFnsLocale });
  }, [anchorDate, view, dateFnsLocale]);

  // ── Dialog handlers ─────────────────────────────────────────────────────────

  function getDateRestrictionMessage(date: Date): string | null {
    if (reservationLimits.isAdmin) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const daysAhead = Math.round((target.getTime() - today.getTime()) / 86400000);

    const { minDaysInAdvance, maxDaysInAdvance } = reservationLimits;

    if (daysAhead < minDaysInAdvance) {
      if (minDaysInAdvance === 0) return t('Reservations cannot be made for past dates.');
      return t('You can only make a reservation at least :count days in advance.', { count: minDaysInAdvance });
    }
    if (maxDaysInAdvance !== null && daysAhead > maxDaysInAdvance) {
      return t('You can only make a reservation up to :count days in advance.', { count: maxDaysInAdvance });
    }
    return null;
  }

  function openSlot(appointment: Appointment, date: Date) {
    setSelectedSlot({ appointment, date });
    setData({
      appointment_id: appointment.id,
      horse_id: '',
      user_id: String(authUserId),
      reservation_date: format(date, 'yyyy-MM-dd'),
      notes: '',
    });
    clearErrors();
  }

  function closeDialog() {
    setSelectedSlot(null);
    reset();
    clearErrors();
  }

  function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    post(route('reservations.store'), {
      onSuccess: () => closeDialog(),
    });
  }

  function openNotifyDialog(appointment: Appointment, date: Date, channel: 'portal' | 'email' | 'sms') {
    const slotRes = getSlotReservations(appointment.id, date);
    const recipientIds = slotRes.map(r => r.user_id);

    const dateStr = format(date, 'EEEE, d. MMMM yyyy', { locale: dateFnsLocale });
    const timeStr = appointment.start_time
      ? `${formatTime(appointment.start_time)}${appointment.end_time ? ` – ${formatTime(appointment.end_time)}` : ''}`
      : '';

    const defaultSubject = `${appointment.name}${timeStr ? ` – ${timeStr}` : ''} – ${dateStr}`;
    const defaultMessage = `${appointment.name}\n${timeStr ? `Ura: ${timeStr}\n` : ''}Datum: ${dateStr}\n\n`;

    setNotifySlot({ appointment, date, channel, recipientIds });
    setNotifyData({
      subject: defaultSubject,
      message: defaultMessage,
      recipient_ids: recipientIds,
      send_to_all: false,
    });
  }

  function closeNotifyDialog() {
    setNotifySlot(null);
    resetNotify();
  }

  function handleNotifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notifySlot) return;

    const routeMap = {
      portal: 'notifications.send-portal',
      email: 'notifications.send-email',
      sms: 'notifications.send-sms',
    };

    postNotify(route(routeMap[notifySlot.channel]), {
      onSuccess: () => closeNotifyDialog(),
      preserveScroll: true,
    });
  }

  function canNotifyAppointment(appointmentId: number): boolean {
    if (!canNotifySlots) return false;
    if (reservationLimits.isAdmin) return true;
    return myTeacherAppointmentIds.includes(appointmentId);
  }

  function handleCancel(reservationId: number) {
    if (!confirm(t('Are you sure you want to cancel this reservation?'))) return;
    router.delete(route('reservations.destroy', reservationId), {
      preserveScroll: true,
    });
  }

  // ── Render: Day Cell Content ────────────────────────────────────────────────

  function renderDaySlots(date: Date, compact: boolean) {
    const dayAppts = getAppointmentsForDay(date);
    if (dayAppts.length === 0) return null;

    return (
      <div className="flex flex-col gap-0.5 mt-1">
        {dayAppts.map((appt) => {
          const slotRes = getSlotReservations(appt.id, date);
          const restriction = getDateRestrictionMessage(date);
          const isTeacherSlot = myTeacherAppointmentIds.includes(appt.id);
          const canNotifyThis = canNotifyAppointment(appt.id);
          return (
            <SlotChip
              key={appt.id}
              appointment={appt}
              date={date}
              reservations={slotRes}
              authUserId={authUserId}
              onClick={() => restriction ? null : openSlot(appt, date)}
              compact={compact}
              disabled={!!restriction}
              disabledReason={restriction ?? undefined}
              isTeacherSlot={isTeacherSlot}
              canNotify={canNotifyThis}
              enabledChannels={enabledChannels}
              onNotify={(channel) => openNotifyDialog(appt, date, channel)}
            />
          );
        })}
      </div>
    );
  }

  // ── Render: Month View ──────────────────────────────────────────────────────

  const weekDayHeaders = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'];

  function renderMonthView() {
    const weeks: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDayHeaders.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="flex-1 grid grid-rows-[repeat(auto-fill,minmax(0,1fr))]" style={{ gridTemplateRows: `repeat(${weeks.length}, minmax(80px, 1fr))` }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day) => {
                const isCurrentMonth = isSameMonth(day, anchorDate);
                const todayClass = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'border-b border-r border-border p-1 min-h-[80px] overflow-hidden',
                      !isCurrentMonth && 'bg-muted/30',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full',
                        todayClass
                          ? 'bg-primary text-primary-foreground'
                          : isCurrentMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {renderDaySlots(day, true)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Render: Week View ───────────────────────────────────────────────────────

  function renderWeekView() {
    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 gap-2 p-2">
          {calendarDays.map((day) => {
            const todayClass = isToday(day);
            return (
              <div key={day.toISOString()} className="flex flex-col gap-1">
                {/* Day header */}
                <div className={cn('text-center pb-1 border-b border-border')}>
                  <div className="text-xs text-muted-foreground uppercase">
                    {format(day, 'EEE', { locale: dateFnsLocale })}
                  </div>
                  <div
                    className={cn(
                      'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mx-auto',
                      todayClass ? 'bg-primary text-primary-foreground' : 'text-foreground',
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
                {renderDaySlots(day, false)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Render: Day View ────────────────────────────────────────────────────────

  function renderDayView() {
    const day = anchorDate;
    const dayAppts = getAppointmentsForDay(day);

    if (dayAppts.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('No appointments for this day.')}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {dayAppts.map((appt) => {
          const slotRes = getSlotReservations(appt.id, day);
          const count = slotRes.length;
          const capacity = appt.capacity;
          const isFull = capacity !== null && count >= capacity;
          const userReservation = slotRes.find((r) => r.user_id === authUserId);

          return (
            <div
              key={appt.id}
              className="border border-border rounded-xl p-4 bg-card shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold text-base">{appt.name}</h3>
                  {appt.start_time && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(appt.start_time)}
                      {appt.end_time && ` – ${formatTime(appt.end_time)}`}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      'inline-block px-2.5 py-1 rounded-full text-xs font-semibold',
                      isFull
                        ? 'bg-red-100 text-red-700'
                        : count / (capacity ?? Infinity) >= 0.7
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700',
                    )}
                  >
                    {isFull ? 'POLNO' : `${count} / ${capacity ?? '∞'}`}
                  </span>
                </div>
              </div>

              {/* Reservation list */}
              {slotRes.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {slotRes.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-2 bg-muted/50 rounded-lg px-3 py-1.5 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          {r.user.name}
                          {r.user_id === authUserId && (
                            <span className="text-xs text-primary font-medium">(jaz)</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <span className="text-xs">🐴</span> {r.horse.name}
                        </span>
                      </div>
                      {(r.user_id === authUserId || canReserveForOthers) && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              {!isFull && !userReservation && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openSlot(appt, day)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('Reserve')}
                </Button>
              )}
              {userReservation && (
                <p className="text-xs text-green-600 font-medium text-center">
                  ✓ {t('You have a reservation')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AuthenticatedLayout>
      <Head title={t('Reservations')} />

      <div className="flex flex-col h-full min-h-0 gap-4 p-4 lg:p-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              {t('Today')}
            </Button>
            <h2 className="text-lg font-semibold capitalize ml-1">{periodLabel}</h2>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-muted">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => switchView(v)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors font-medium',
                  view === v
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {v === 'month' ? t('Month') : v === 'week' ? t('Week') : t('Day')}
              </button>
            ))}
          </div>
        </div>

        {/* ── Calendar ── */}
        <div className="flex-1 border border-border rounded-xl bg-background overflow-hidden flex flex-col min-h-[400px]">
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </div>

        {/* ── My upcoming reservations ── */}
        {myUpcoming.length > 0 && (
          <div className="border border-border rounded-xl bg-card p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              {t('My upcoming reservations')}
            </h3>
            <div className="space-y-2">
              {myUpcoming.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 text-sm py-1.5 px-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-medium whitespace-nowrap">
                      {format(parseISO(r.reservation_date), 'EEE d. MMM', { locale: dateFnsLocale })}
                    </span>
                    {r.appointment.start_time && (
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(r.appointment.start_time)}
                      </span>
                    )}
                    <span className="truncate">{r.appointment.name}</span>
                    <span className="text-muted-foreground text-xs flex items-center gap-1 shrink-0">
                      <span>🐴</span> {r.horse.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCancel(r.id)}
                    className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                    title={t('Cancel reservation')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Reservation Dialog ── */}
      <Dialog open={!!selectedSlot} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('New reservation')}</DialogTitle>
            {selectedSlot && (
              <DialogDescription>
                {selectedSlot.appointment.name}
                {selectedSlot.appointment.start_time && (
                  <span>
                    {' '}· {formatTime(selectedSlot.appointment.start_time)}
                    {selectedSlot.appointment.end_time &&
                      ` – ${formatTime(selectedSlot.appointment.end_time)}`}
                  </span>
                )}
                <span className="block mt-0.5">
                  {format(selectedSlot.date, 'EEEE, d. MMMM yyyy', { locale: dateFnsLocale })}
                </span>
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedSlot && (
            <form onSubmit={handleReserve} className="space-y-4 pt-2">
              {/* Date restriction warning */}
              {getDateRestrictionMessage(selectedSlot.date) && (
                <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{getDateRestrictionMessage(selectedSlot.date)}</span>
                </div>
              )}
              {/* errors.reservation_date from backend */}
              {errors.reservation_date && (
                <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errors.reservation_date}</span>
                </div>
              )}
              {/* Capacity info */}
              {selectedSlot.appointment.capacity && (
                <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>
                    {t('Available')}: {' '}
                    <strong>
                      {selectedSlot.appointment.capacity - selectedSlotReservations.length}
                    </strong>
                    {' '}/{' '}{selectedSlot.appointment.capacity} {t('spots')}
                  </span>
                </div>
              )}

              {/* User selection (admin only) */}
              {canReserveForOthers && (
                <div className="space-y-1.5">
                  <Label>{t('Rider')}</Label>
                  <Select
                    value={data.user_id}
                    onValueChange={(v) => setData('user_id', v)}
                  >
                    <SelectTrigger className={errors.user_id ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('Select rider...')} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name}
                          {u.id === authUserId && ` (${t('me')})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.user_id && (
                    <p className="text-xs text-destructive">{errors.user_id}</p>
                  )}
                </div>
              )}

              {/* Horse selection */}
              <div className="space-y-1.5">
                <Label>{t('Horse')}</Label>
                <Select
                  value={data.horse_id}
                  onValueChange={(v) => setData('horse_id', v)}
                >
                  <SelectTrigger className={errors.horse_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('Select horse...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {horses.map((h) => {
                      const isBooked = selectedSlotReservations.some((r) => r.horse_id === h.id);
                      return (
                        <SelectItem key={h.id} value={String(h.id)} disabled={isBooked}>
                          <span className={isBooked ? 'text-muted-foreground line-through' : ''}>
                            {h.name}
                          </span>
                          {isBooked && (
                            <span className="ml-2 text-xs text-red-500">{t('booked')}</span>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.horse_id && (
                  <p className="text-xs text-destructive">{errors.horse_id}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label>{t('Note')} ({t('optional')})</Label>
                <Textarea
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  placeholder={t('Additional information...')}
                  rows={2}
                  className={errors.notes ? 'border-destructive' : ''}
                />
                {errors.notes && (
                  <p className="text-xs text-destructive">{errors.notes}</p>
                )}
              </div>

              {/* General error */}
              {errors.appointment_id && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errors.appointment_id}
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog} disabled={processing}>
                  {t('Cancel')}
                </Button>
                <Button type="submit" disabled={processing || !data.horse_id}>
                  {processing ? t('Saving...') : t('Reserve')}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Existing reservations in slot — visible to all */}
          {selectedSlot && selectedSlotReservations.length > 0 && (
            <div className="border-t border-border pt-4 mt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t('Current reservations')}
              </p>
              <div className="space-y-1.5">
                {selectedSlotReservations.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-1.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span>🐴</span>
                        <span className="font-medium">{r.horse.name}</span>
                      </span>
                      {canReserveForOthers && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <User className="w-3.5 h-3.5" />
                          {r.user.name}
                          {r.user_id === authUserId && (
                            <span className="text-xs text-primary font-medium">({t('me')})</span>
                          )}
                        </span>
                      )}
                      {!canReserveForOthers && r.user_id === authUserId && (
                        <span className="text-xs text-primary font-medium">({t('me')})</span>
                      )}
                    </div>
                    {(r.user_id === authUserId || canReserveForOthers) && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Notify Slot Dialog ── */}
      <Dialog open={!!notifySlot} onOpenChange={closeNotifyDialog}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleNotifySubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {notifySlot?.channel === 'portal' && <Bell className="h-4 w-4" />}
                {notifySlot?.channel === 'email' && <Mail className="h-4 w-4" />}
                {notifySlot?.channel === 'sms' && <MessageSquare className="h-4 w-4" />}
                {notifySlot?.channel === 'portal' && t('Send Portal Notification')}
                {notifySlot?.channel === 'email' && t('Send Email')}
                {notifySlot?.channel === 'sms' && t('Send SMS')}
              </DialogTitle>
              {notifySlot && (
                <DialogDescription>
                  {notifySlot.appointment.name}
                  {notifySlot.appointment.start_time && (
                    <span> · {formatTime(notifySlot.appointment.start_time)}
                      {notifySlot.appointment.end_time && ` – ${formatTime(notifySlot.appointment.end_time)}`}
                    </span>
                  )}
                  <span className="block mt-0.5">
                    {format(notifySlot.date, 'EEEE, d. MMMM yyyy', { locale: dateFnsLocale })}
                  </span>
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Recipients */}
              <div className="space-y-2">
                <Label>{t('Recipients')}</Label>
                {notifySlot && notifySlot.recipientIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 border rounded-md p-2 bg-muted/30 min-h-[40px]">
                    {notifySlot.recipientIds.map(uid => {
                      const u = users.find(u => u.id === uid);
                      return u ? (
                        <Badge key={uid} variant="secondary">{u.name}</Badge>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic border rounded-md p-2">
                    {t('No reservations for this slot — no recipients.')}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {notifySlot?.recipientIds.length ?? 0} {t('recipients')}
                </p>
              </div>

              {/* Subject — only for portal and email */}
              {notifySlot?.channel !== 'sms' && (
                <div className="space-y-2">
                  <Label htmlFor="notify-subject">{t('Subject')}</Label>
                  <Input
                    id="notify-subject"
                    value={notifyData.subject}
                    onChange={e => setNotifyData('subject', e.target.value)}
                    required
                  />
                  {notifyErrors.subject && <p className="text-xs text-red-500">{notifyErrors.subject}</p>}
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="notify-message">{t('Message')}</Label>
                <Textarea
                  id="notify-message"
                  value={notifyData.message}
                  onChange={e => setNotifyData('message', e.target.value)}
                  required
                  rows={6}
                />
                {notifyErrors.message && <p className="text-xs text-red-500">{notifyErrors.message}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeNotifyDialog}>
                {t('Cancel')}
              </Button>
              <Button
                type="submit"
                disabled={notifyProcessing || (notifySlot?.recipientIds.length === 0)}
              >
                <Send className="mr-2 h-4 w-4" />
                {t('Send')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}
