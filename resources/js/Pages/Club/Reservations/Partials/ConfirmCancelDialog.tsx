import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { format, parseISO } from 'date-fns';
import type { Locale } from 'date-fns';
import { Appointment, Reservation, ReservationWithAppointment } from '../types';

interface ConfirmCancelDialogProps {
  reservation: Reservation | ReservationWithAppointment | null;
  appointments: Appointment[];
  dateFnsLocale: Locale;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmCancelDialog({
  reservation,
  appointments,
  dateFnsLocale,
  onClose,
  onConfirm,
}: ConfirmCancelDialogProps) {
  const { t } = useTranslation();

  const appointmentName = reservation
    ? 'appointment' in reservation
      ? reservation.appointment.name
      : (appointments.find(a => a.id === reservation.appointment_id)?.name ?? '')
    : '';

  return (
    <Dialog open={!!reservation} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            {t('Cancel reservation')}
          </DialogTitle>
          <DialogDescription>
            {t('Are you sure you want to cancel this reservation?')}
          </DialogDescription>
        </DialogHeader>
        {reservation && (
          <div className="rounded-lg bg-muted px-4 py-3 text-sm space-y-1">
            <p className="font-medium">{appointmentName}</p>
            <p className="text-muted-foreground">
              {format(parseISO(reservation.reservation_date), 'EEEE, d. MMMM yyyy', { locale: dateFnsLocale })}
            </p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('Close')}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('Cancel reservation')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
