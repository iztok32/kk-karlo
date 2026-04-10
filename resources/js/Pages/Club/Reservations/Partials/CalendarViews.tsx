import { CalendarDays, User } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import {
  format,
  isToday,
  isSameMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import type { Locale } from 'date-fns';
import { Plus, Trash2, Clock } from 'lucide-react';
import {
  Appointment,
  Reservation,
  ReservationLimits,
  formatTime,
  appointmentOnDate,
} from '../types';
import SlotChip from './SlotChip';

interface CalendarViewsProps {
  view: 'month' | 'week' | 'day';
  anchorDate: Date;
  calendarDays: Date[];
  appointments: Appointment[];
  reservations: Reservation[];
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

function getDateRestrictionMessage(date: Date, limits: ReservationLimits, t: (key: string, params?: Record<string, unknown>) => string): string | null {
  if (limits.isAdmin) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const daysAhead = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (daysAhead < limits.minDaysInAdvance) {
    if (limits.minDaysInAdvance === 0) return t('Reservations cannot be made for past dates.');
    return t('You can only make a reservation at least :count days in advance.', { count: limits.minDaysInAdvance });
  }
  if (limits.maxDaysInAdvance !== null && daysAhead > limits.maxDaysInAdvance) {
    return t('You can only make a reservation up to :count days in advance.', { count: limits.maxDaysInAdvance });
  }
  return null;
}

const weekDayHeaders = ['Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob', 'Ned'];

export default function CalendarViews({
  view,
  anchorDate,
  calendarDays,
  appointments,
  reservations,
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
  const { t } = useTranslation();

  function getSlotReservations(appointmentId: number, date: Date): Reservation[] {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations.filter(
      (r) => r.appointment_id === appointmentId && r.reservation_date.slice(0, 10) === dateStr,
    );
  }

  function getAppointmentsForDay(date: Date): Appointment[] {
    return appointments.filter((a) => appointmentOnDate(a, date));
  }

  function canNotifyAppointment(appointmentId: number): boolean {
    if (!canNotifySlots) return false;
    if (reservationLimits.isAdmin) return true;
    return myTeacherAppointmentIds.includes(appointmentId);
  }

  function renderDaySlots(date: Date, compact: boolean) {
    const dayAppts = getAppointmentsForDay(date);
    if (dayAppts.length === 0) return null;
    const restriction = getDateRestrictionMessage(date, reservationLimits, t);

    return (
      <div className="flex flex-col gap-0.5 mt-1">
        {dayAppts.map((appt) => (
          <SlotChip
            key={appt.id}
            appointment={appt}
            reservations={getSlotReservations(appt.id, date)}
            authUserId={authUserId}
            onClick={() => restriction ? undefined : onOpenSlot(appt, date)}
            compact={compact}
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
        <div className="grid grid-cols-7 border-b border-border">
          {weekDayHeaders.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-rows-[repeat(auto-fill,minmax(0,1fr))]" style={{ gridTemplateRows: `repeat(${weeks.length}, minmax(80px, 1fr))` }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn('border-b border-r border-border p-1 min-h-[80px] overflow-hidden', !isSameMonth(day, anchorDate) && 'bg-muted/30')}
                >
                  <span className={cn(
                    'inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full',
                    isToday(day) ? 'bg-primary text-primary-foreground' : isSameMonth(day, anchorDate) ? 'text-foreground' : 'text-muted-foreground',
                  )}>
                    {format(day, 'd')}
                  </span>
                  {renderDaySlots(day, true)}
                </div>
              ))}
            </div>
          ))}
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

        return (
          <div key={appt.id} className="border border-border rounded-xl p-4 bg-card shadow-sm">
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
                {appt.teachers.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <User className="inline w-3 h-3 mr-1 opacity-60" />
                    {appt.teachers.map(t => t.name).join(', ')}
                  </p>
                )}
              </div>
              <span className={cn(
                'inline-block px-2.5 py-1 rounded-full text-xs font-semibold',
                isFull ? 'bg-red-100 text-red-700' : count / (capacity ?? Infinity) >= 0.7 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700',
              )}>
                {isFull ? 'POLNO' : `${count} / ${capacity ?? '∞'}`}
              </span>
            </div>

            {slotRes.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {slotRes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-2 bg-muted/50 rounded-lg px-3 py-1.5 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        {r.user.name}
                        {r.user_id === authUserId && <span className="text-xs text-primary font-medium">(jaz)</span>}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-xs">🐴</span> {r.horse.name}
                      </span>
                    </div>
                    {(r.user_id === authUserId || canReserveForOthers) && (
                      <button onClick={() => onCancel(r)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
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
        );
      })}
    </div>
  );
}
