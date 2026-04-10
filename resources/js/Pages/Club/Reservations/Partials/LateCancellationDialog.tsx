import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { AlertCircle, Send } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { format, parseISO } from 'date-fns';
import type { Locale } from 'date-fns';
import { Appointment, LateCancelInfo, Teacher } from '../types';

interface LateCancellationDialogProps {
  lateCancelInfo: LateCancelInfo | null;
  appointments: Appointment[];
  defaultAdmins: Teacher[];
  dateFnsLocale: Locale;
  processing: boolean;
  onClose: () => void;
  onSend: () => void;
}

export default function LateCancellationDialog({
  lateCancelInfo,
  appointments,
  defaultAdmins,
  dateFnsLocale,
  processing,
  onClose,
  onSend,
}: LateCancellationDialogProps) {
  const { t } = useTranslation();

  const apptTeachers = lateCancelInfo
    ? (appointments.find(a => a.id === lateCancelInfo.appointmentId)?.teachers ?? [])
    : [];
  const recipients = apptTeachers.length > 0 ? apptTeachers : defaultAdmins;

  return (
    <Dialog open={!!lateCancelInfo} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-5 h-5" />
            {t('Cancellation deadline passed')}
          </DialogTitle>
          <DialogDescription>
            {t('The deadline for cancelling this reservation has passed.')}
          </DialogDescription>
        </DialogHeader>
        {lateCancelInfo && (
          <div className="space-y-3">
            <div className="rounded-lg bg-muted px-4 py-3 text-sm space-y-1">
              <p className="font-medium">{lateCancelInfo.appointmentName}</p>
              <p className="text-muted-foreground">
                {format(parseISO(lateCancelInfo.reservationDate), 'EEEE, d. MMMM yyyy', { locale: dateFnsLocale })}
              </p>
            </div>
            <div className="rounded-lg border px-4 py-3 text-sm space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {apptTeachers.length > 0
                  ? t('Notification will be sent to teacher')
                  : t('Notification will be sent to administrator')}
              </p>
              {recipients.length > 0 ? (
                recipients.map(r => (
                  <p key={r.id} className="font-medium">{r.name}</p>
                ))
              ) : (
                <p className="text-muted-foreground italic">
                  {t('No recipients configured in settings.')}
                </p>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={processing}>
            {t('Close')}
          </Button>
          <Button onClick={onSend} disabled={processing}>
            <Send className="mr-2 h-4 w-4" />
            {processing ? t('Sending...') : t('Send notification')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
