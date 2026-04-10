import { CalendarDays, Clock, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { format, parseISO } from 'date-fns';
import type { Locale } from 'date-fns';
import { ReservationWithAppointment, formatTime } from '../types';

interface UpcomingReservationsProps {
  reservations: ReservationWithAppointment[];
  dateFnsLocale: Locale;
  onCancel: (reservation: ReservationWithAppointment) => void;
}

export default function UpcomingReservations({ reservations, dateFnsLocale, onCancel }: UpcomingReservationsProps) {
  const { t } = useTranslation();

  if (reservations.length === 0) return null;

  return (
    <div className="border border-border rounded-xl bg-card p-4">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <CalendarDays className="w-4 h-4" />
        {t('My upcoming reservations')}
      </h3>
      <div className="space-y-2">
        {reservations.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 text-sm py-1.5 px-3 rounded-lg bg-muted/50">
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
              onClick={() => onCancel(r)}
              className="text-red-400 hover:text-red-600 transition-colors shrink-0"
              title={t('Cancel reservation')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
