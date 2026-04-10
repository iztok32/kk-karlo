import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Bell, Mail, MessageSquare, Send } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { NotifySlot, UserItem, formatTime } from '../types';

interface NotifySlotDialogProps {
  notifySlot: NotifySlot | null;
  users: UserItem[];
  dateFnsLocale: Locale;
  formData: { subject: string; message: string; recipient_ids: number[]; send_to_all: boolean };
  errors: Partial<Record<string, string>>;
  processing: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (field: string, value: string) => void;
}

export default function NotifySlotDialog({
  notifySlot,
  users,
  dateFnsLocale,
  formData,
  errors,
  processing,
  onClose,
  onSubmit,
  onFieldChange,
}: NotifySlotDialogProps) {
  const { t } = useTranslation();

  const channelIcon = notifySlot?.channel === 'portal'
    ? <Bell className="h-4 w-4" />
    : notifySlot?.channel === 'email'
    ? <Mail className="h-4 w-4" />
    : <MessageSquare className="h-4 w-4" />;

  const channelLabel = notifySlot?.channel === 'portal'
    ? t('Send Portal Notification')
    : notifySlot?.channel === 'email'
    ? t('Send Email')
    : t('Send SMS');

  return (
    <Dialog open={!!notifySlot} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {channelIcon}
              {channelLabel}
            </DialogTitle>
            {notifySlot && (
              <DialogDescription>
                {notifySlot.appointment.name}
                {notifySlot.appointment.start_time && (
                  <span>
                    {' '}· {formatTime(notifySlot.appointment.start_time)}
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
            <div className="space-y-2">
              <Label>{t('Recipients')}</Label>
              {notifySlot && notifySlot.recipientIds.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 border rounded-md p-2 bg-muted/30 min-h-[40px]">
                  {notifySlot.recipientIds.map(uid => {
                    const u = users.find(u => u.id === uid);
                    return u ? <Badge key={uid} variant="secondary">{u.name}</Badge> : null;
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

            {notifySlot?.channel !== 'sms' && (
              <div className="space-y-2">
                <Label htmlFor="notify-subject">{t('Subject')}</Label>
                <Input
                  id="notify-subject"
                  value={formData.subject}
                  onChange={e => onFieldChange('subject', e.target.value)}
                  required
                />
                {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notify-message">{t('Message')}</Label>
              <Textarea
                id="notify-message"
                value={formData.message}
                onChange={e => onFieldChange('message', e.target.value)}
                required
                rows={6}
              />
              {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('Cancel')}
            </Button>
            <Button type="submit" disabled={processing || (notifySlot?.recipientIds.length === 0)}>
              <Send className="mr-2 h-4 w-4" />
              {t('Send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
