import { CalendarDays, User } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import {
  format,
  parseISO,
  isToday,
  isSameMonth,
} from 'date-fns';
import type { Locale } from 'date-fns';
import { Plus, Trash2, Clock, Info } from 'lucide-react';
import {
  Appointment,
  AppointmentTypeItem,
  Holiday,
  Reservation,
  ReservationLimits,
  TYPE_COLOR_PALETTE,
  formatTime,
  appointmentOnDate,
  getTypeColorEntry,
} from '../types';
import SlotChip from './SlotChip';

const LOCALE_COUNTRY: Record<string, string> = {
  sl: 'SI',
  hr: 'HR',
  it: 'IT',
  de: 'DE',
  en: 'GB',
};

interface CalendarViewsProps {
  view: 'month' | 'week' | 'day';
  anchorDate: Date;
  calendarDays: Date[];
  appointments: Appointment[];
  appointmentTypes: AppointmentTypeItem[];
  reservations: Reservation[];
  holidays: Holiday[];
  authUserId: number;
  reservationLimits: ReservationLimits;
  myTeacherAppointmentIds: number[];
  canNotifySlots: boolean;
  canReserveForOthers: boolean;
  enabledChannels: ('portal' | 'email' | 'sms')[];
  dateFnsLocale: Locale;
  onOpenSlot: (appointment: Appointment, date: Date) => void;
  onCancel: (reservation: Reservation) => void;
  onNotify: (appointment: Appointment, date: Date, channel: 'portal' | 'email' | 'sms') => void;
}

function getDateRestrictionMessage(date: Date, limits: ReservationLimits, t: (key: string, replacements?: Record<string, string>) => string): string | null {
  if (limits.isAdmin) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const daysAhead = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (daysAhead < limits.minDaysInAdvance) {
    if (limits.minDaysInAdvance === 0) return t('Reservations cannot be made for past dates.');
    return t('You can only make a reservation at least :count days in advance.', { count: String(limits.minDaysInAdvance) });
  }
  if (limits.maxDaysInAdvance !== null && daysAhead > limits.maxDaysInAdvance) {
    return t('You can only make a reservation up to :count days in advance.', { count: String(limits.maxDaysInAdvance) });
  }
  return null;
}

const weekDayHeaders = ['Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota', 'Nedelja'];

export default function CalendarViews({
  view,
  anchorDate,
  calendarDays,
  appointments,
  appointmentTypes,
  reservations,
  holidays,
  authUserId,
  reservationLimits,
  myTeacherAppointmentIds,
  canNotifySlots,
  canReserveForOthers,
  enabledChannels,
  dateFnsLocale,
  onOpenSlot,
  onCancel,
  onNotify,
}: CalendarViewsProps) {
  const { t, locale } = useTranslation();

  const countryCode = LOCALE_COUNTRY[locale] ?? 'SI';

  function getHolidayForDay(date: Date): Holiday | undefined {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.find(h => h.date === dateStr && h.country_code === countryCode);
  }

  function getSlotReservations(appointmentId: number, date: Date): Reservation[] {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations.filter(
      (r) => r.appointment_id === appointmentId && r.reservation_date.slice(0, 10) === dateStr,
    );
  }

  /** All views: only valid appointments for this day */
  function getAppointmentsForDay(date: Date): Appointment[] {
    return appointments.filter((a) => appointmentOnDate(a, date));
  }

  function canNotifyAppointment(appointmentId: number): boolean {
    if (!canNotifySlots) return false;
    if (reservationLimits.isAdmin) return true;
    return myTeacherAppointmentIds.includes(appointmentId);
  }

  // ── Compact slot (month view) ────────────────────────────────────────────────
  function renderCompactSlot(appt: Appointment, date: Date, restriction: string | null) {
    const slotRes = getSlotReservations(appt.id, date);
    const count = slotRes.length;
    const capacity = appt.capacity;
    const free = capacity !== null ? Math.max(0, capacity - count) : null;
    const isFull = capacity !== null && count >= capacity;
    const userHasRes = slotRes.some((r) => r.user_id === authUserId);
    const isTeacher = myTeacherAppointmentIds.includes(appt.id);
    const isClickable = !restriction && !(isFull && !userHasRes);
    const colors = getTypeColorEntry(appt.type, appointmentTypes);

    const timeStr = appt.start_time
      ? `${formatTime(appt.start_time)}${appt.end_time ? `–${formatTime(appt.end_time)}` : ''}`
      : appt.name;

    const freeLabel = free !== null ? `(${free})` : '';

    return (
      <Tooltip key={appt.id}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={isClickable ? () => onOpenSlot(appt, date) : undefined}
            className={cn(
              'w-full text-left text-xs leading-snug px-0.5 py-px rounded flex items-center gap-1',
              isClickable ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5' : 'cursor-default',
              userHasRes ? 'font-semibold' : '',
              isFull && !userHasRes ? 'opacity-50' : '',
            )}
          >
            <span className={cn('inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-px', colors.dot)} />
            {timeStr} {freeLabel}
            {userHasRes && <span className="ml-0.5">🐴</span>}
            {isTeacher && <span className="ml-0.5 opacity-50 text-[10px]">★</span>}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[220px]">
          <p className="font-medium">{appt.name}</p>
          {appt.start_time && (
            <p className="text-xs opacity-75">
              {formatTime(appt.start_time)}{appt.end_time && ` – ${formatTime(appt.end_time)}`}
            </p>
          )}
          <p className="text-xs mt-0.5">
            {isFull
              ? t('Full')
              : free !== null
              ? `${free} ${t('free spots')}`
              : `${count} ${t('reservations')}`}
          </p>
          {slotRes.map((r) => (
            <p key={r.id} className="text-xs">{r.horse ? `🐴 ${r.horse.name} – ` : ''}{r.user.name}</p>
          ))}
          {userHasRes && <p className="text-xs font-medium text-green-400 mt-0.5">✓ {t('You have a reservation')}</p>}
          {isTeacher && <p className="text-xs opacity-70">★ {t('Your appointment')}</p>}
          {restriction && <p className="text-xs text-amber-300 mt-1">⚠ {restriction}</p>}
        </TooltipContent>
      </Tooltip>
    );
  }

  // ── Slot row (month compact / week full) ────────────────────────────────────
  function renderDaySlots(date: Date, compact: boolean) {
    const dayAppts = getAppointmentsForDay(date);
    if (dayAppts.length === 0) return null;
    const restriction = getDateRestrictionMessage(date, reservationLimits, t);

    if (compact) {
      return (
        <div className="flex flex-col mt-0.5">
          {dayAppts.map((appt) => renderCompactSlot(appt, date, restriction))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-0.5 mt-1">
        {dayAppts.map((appt) => (
          <SlotChip
            key={appt.id}
            appointment={appt}
            appointmentTypes={appointmentTypes}
            reservations={getSlotReservations(appt.id, date)}
            authUserId={authUserId}
            onClick={() => restriction ? undefined : onOpenSlot(appt, date)}
            compact={false}
            disabled={!!restriction}
            disabledReason={restriction ?? undefined}
            isTeacherSlot={myTeacherAppointmentIds.includes(appt.id)}
            canNotify={canNotifyAppointment(appt.id)}
            enabledChannels={enabledChannels}
            onNotify={(channel) => onNotify(appt, date, channel)}
          />
        ))}
      </div>
    );
  }

  // ── Month View ──────────────────────────────────────────────────────────────

  if (view === 'month') {
    const weeks: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDayHeaders.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div
          className="flex-1 overflow-auto grid"
          style={{ gridTemplateRows: `repeat(${weeks.length}, minmax(80px, 1fr))` }}
        >
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'border-b border-r border-border p-1 min-h-[80px] overflow-hidden',
                    !isSameMonth(day, anchorDate) && 'bg-muted/30',
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      'inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full',
                      isToday(day)
                        ? 'bg-primary text-primary-foreground'
                        : isSameMonth(day, anchorDate)
                        ? 'text-foreground'
                        : 'text-muted-foreground',
                    )}>
                      {format(day, 'd')}
                    </span>
                    {(() => {
                      const holiday = getHolidayForDay(day);
                      if (!holiday) return null;
                      return (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs leading-none cursor-default select-none">⭐</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {holiday.local_name ?? holiday.name}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })()}
                  </div>
                  {renderDaySlots(day, true)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="shrink-0 border-t border-border px-4 py-2.5">
          <p className="text-xs font-semibold mb-1.5">{t('Legend')}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 items-center text-xs text-muted-foreground">
            {/* Appointment type colors */}
            {appointmentTypes.map((at, idx) => {
              const palette = TYPE_COLOR_PALETTE[idx % TYPE_COLOR_PALETTE.length];
              return (
                <span key={at.id} className="flex items-center gap-1.5">
                  <span className={cn('inline-block w-2.5 h-2.5 rounded-full shrink-0', palette.dot)} />
                  {at.name}
                </span>
              );
            })}
            <span className="flex items-center gap-1.5">
              <span>🐴</span>
              <span>{t('I have a reservation')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>⭐</span>
              <span>{t('Public holiday')}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Week View ───────────────────────────────────────────────────────────────

  if (view === 'week') {
    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 gap-2 p-2">
          {calendarDays.map((day) => (
            <div key={day.toISOString()} className="flex flex-col gap-1">
              <div className="text-center pb-1 border-b border-border">
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEE', { locale: dateFnsLocale })}
                </div>
                <div className={cn(
                  'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mx-auto',
                  isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground',
                )}>
                  {format(day, 'd')}
                </div>
              </div>
              {renderDaySlots(day, false)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Day View ────────────────────────────────────────────────────────────────

  const dayAppts = getAppointmentsForDay(anchorDate);

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
        const slotRes = getSlotReservations(appt.id, anchorDate);
        const count = slotRes.length;
        const capacity = appt.capacity;
        const isFull = capacity !== null && count >= capacity;
        const userReservation = slotRes.find((r) => r.user_id === authUserId);
        const colors = getTypeColorEntry(appt.type, appointmentTypes);
        const typeName = appointmentTypes.find(at => at.id === appt.type)?.name;

        return (
          <div key={appt.id} className="border border-border rounded-xl p-4 bg-card shadow-sm overflow-hidden relative">
            {/* Type color bar on left */}
            <div className={cn('absolute left-0 top-0 bottom-0 w-1', colors.dot)} />
            <div className="pl-3">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-base">{appt.name}</h3>
                    {typeName && (
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full border', colors.medium)}>
                        {typeName}
                      </span>
                    )}
                  </div>
                  {appt.start_time && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(appt.start_time)}
                      {appt.end_time && ` – ${formatTime(appt.end_time)}`}
                    </p>
                  )}
                  {appt.teachers.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <User className="inline w-3 h-3 mr-1 opacity-60" />
                      {appt.teachers.map(t => t.name).join(', ')}
                    </p>
                  )}
                </div>
                <span className={cn(
                  'inline-block px-2.5 py-1 rounded-full text-xs font-semibold',
                  isFull
                    ? 'bg-red-100 text-red-700'
                    : count / (capacity ?? Infinity) >= 0.7
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700',
                )}>
                  {isFull ? 'POLNO' : `${count} / ${capacity ?? '∞'}`}
                </span>
              </div>

              {slotRes.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {slotRes.map((r) => {
                    const createdAt  = r.created_at  ? parseISO(r.created_at)  : null;
                    const updatedAt  = r.updated_at  ? parseISO(r.updated_at)  : null;
                    const wasEdited  = createdAt && updatedAt && Math.abs(updatedAt.getTime() - createdAt.getTime()) > 5000;
                    const creatorName = r.created_by?.name ?? null;
                    const fmt = (d: Date) => format(d, 'd. M. yyyy HH:mm');

                    return (
                      <div key={r.id} className="flex items-center justify-between gap-2 bg-muted/50 rounded-lg px-3 py-1.5 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex items-center gap-1 shrink-0">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            {r.user.name}
                            {r.user_id === authUserId && <span className="text-xs text-primary font-medium">(jaz)</span>}
                          </span>
                          {r.horse && (
                            <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                              <span className="text-xs">🐴</span> {r.horse.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs space-y-0.5 max-w-[220px]">
                              {createdAt && (
                                <p>
                                  <span className="opacity-60">Oddano:</span>{' '}
                                  {fmt(createdAt)}
                                </p>
                              )}
                              {creatorName && (
                                <p>
                                  <span className="opacity-60">Ustvaril:</span>{' '}
                                  {creatorName}
                                  {r.created_by_user_id === r.user_id ? ' (sam)' : ''}
                                </p>
                              )}
                              {!creatorName && !createdAt && (
                                <p className="opacity-60">Ni podatkov o ustvarjanju.</p>
                              )}
                              {wasEdited && updatedAt && (
                                <p className="text-amber-400">
                                  <span className="opacity-80">Spremenjena:</span>{' '}
                                  {fmt(updatedAt)}
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                          {(r.user_id === authUserId || canReserveForOthers) && (
                            <button onClick={() => onCancel(r)} className="text-red-500 hover:text-red-700 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isFull && !userReservation && (
                <Button size="sm" variant="outline" onClick={() => onOpenSlot(appt, anchorDate)} className="w-full">
                  <Plus className="w-4 h-4 mr-1" />
                  {t('Reserve')}
                </Button>
              )}
              {userReservation && (
                <p className="text-xs text-green-600 font-medium text-center">✓ {t('You have a reservation')}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
