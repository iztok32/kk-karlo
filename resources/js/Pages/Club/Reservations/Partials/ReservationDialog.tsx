import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { AlertCircle, Trash2, User } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { Link } from '@inertiajs/react';
import { Appointment, AppointmentTypeItem, Reservation, HorseItem, UserItem, ReservationLimits, formatTime } from '../types';

interface ReservationDialogProps {
  open: boolean;
  slot: { appointment: Appointment; date: Date } | null;
  slotReservations: Reservation[];
  appointmentTypes: AppointmentTypeItem[];
  horses: HorseItem[];
  users: UserItem[];
  authUserId: number;
  canReserveForOthers: boolean;
  reservationLimits: ReservationLimits;
  dateFnsLocale: Locale;
  couponBalances: Record<number, Record<number, number>>;
  formData: { appointment_id: number; horse_id: string; user_id: string; reservation_date: string; notes: string };
  errors: Partial<Record<string, string>>;
  processing: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (field: string, value: string) => void;
  onCancel: (reservation: Reservation) => void;
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

export default function ReservationDialog({
  open,
  slot,
  slotReservations,
  appointmentTypes,
  horses,
  users,
  authUserId,
  canReserveForOthers,
  reservationLimits,
  dateFnsLocale,
  formData,
  errors,
  processing,
  couponBalances,
  onClose,
  onSubmit,
  onFieldChange,
  onCancel,
}: ReservationDialogProps) {
  const { t } = useTranslation();
  const restriction = slot ? getDateRestrictionMessage(slot.date, reservationLimits, t) : null;
  const apptType = slot ? appointmentTypes.find(at => at.id === slot.appointment.type) : null;
  const horsesSelectable = apptType?.horses_selectable ?? true;

  const requiredCouponTypeId = apptType?.coupon_type_id ?? null;
  const targetUserId = formData.user_id ? Number(formData.user_id) : null;
  const couponInsufficient = requiredCouponTypeId !== null && targetUserId !== null
    ? !((couponBalances[targetUserId]?.[requiredCouponTypeId] ?? 0) >= 1)
    : false;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('New reservation')}</DialogTitle>
          {slot && (
            <DialogDescription asChild>
              <div>
                <span>
                  {slot.appointment.name}
                  {slot.appointment.start_time && (
                    <span>
                      {' '}· {formatTime(slot.appointment.start_time)}
                      {slot.appointment.end_time && ` – ${formatTime(slot.appointment.end_time)}`}
                    </span>
                  )}
                </span>
                <span className="block mt-0.5">
                  {format(slot.date, 'EEEE, d. MMMM yyyy', { locale: dateFnsLocale })}
                </span>
                {slot.appointment.teachers.length > 0 && (
                  <span className="flex items-center gap-1 mt-1">
                    <User className="w-3.5 h-3.5 opacity-60" />
                    {slot.appointment.teachers.map(t => t.name).join(', ')}
                  </span>
                )}
              </div>
            </DialogDescription>
          )}
        </DialogHeader>

        {slot && (
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            {restriction && (
              <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{restriction}</span>
              </div>
            )}
            {errors.reservation_date && (
              <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errors.reservation_date}</span>
              </div>
            )}
            {errors.coupon && (
              <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errors.coupon}</span>
              </div>
            )}
            {couponInsufficient && !errors.coupon && (
              <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {t('Insufficient coupon balance for this appointment type.')}{' '}
                  <Link href={route('coupons.index')} className="underline font-medium" onClick={onClose}>
                    {t('Purchase coupons')}
                  </Link>
                </span>
              </div>
            )}
            {slot.appointment.capacity && (
              <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>
                  {t('Available')}:{' '}
                  <strong>{slot.appointment.capacity - slotReservations.length}</strong>
                  {' '}/{' '}{slot.appointment.capacity} {t('spots')}
                </span>
              </div>
            )}

            {canReserveForOthers && (
              <div className="space-y-1.5">
                <Label>{t('Rider')}</Label>
                <Select value={formData.user_id} onValueChange={(v) => onFieldChange('user_id', v)}>
                  <SelectTrigger className={errors.user_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('Select rider...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name}{u.id === authUserId && ` (${t('me')})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.user_id && <p className="text-xs text-destructive">{errors.user_id}</p>}
              </div>
            )}

            {horsesSelectable && (
              <div className="space-y-1.5">
                <Label>{t('Horse')} <span className="text-muted-foreground text-xs">({t('optional')})</span></Label>
                <Select value={formData.horse_id} onValueChange={(v) => onFieldChange('horse_id', v)}>
                  <SelectTrigger className={errors.horse_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('Select horse...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {horses.map((h) => {
                      const isBooked = slotReservations.some((r) => r.horse_id === h.id);
                      return (
                        <SelectItem key={h.id} value={String(h.id)} disabled={isBooked}>
                          <span className={isBooked ? 'text-muted-foreground line-through' : ''}>{h.name}</span>
                          {isBooked && <span className="ml-2 text-xs text-red-500">{t('booked')}</span>}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.horse_id && <p className="text-xs text-destructive">{errors.horse_id}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>{t('Note')} ({t('optional')})</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => onFieldChange('notes', e.target.value)}
                placeholder={t('Additional information...')}
                rows={2}
                className={errors.notes ? 'border-destructive' : ''}
              />
              {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
            </div>

            {errors.appointment_id && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errors.appointment_id}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                {t('Cancel')}
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? t('Saving...') : t('Reserve')}
              </Button>
            </DialogFooter>
          </form>
        )}

        {slot && slotReservations.length > 0 && (
          <div className="border-t border-border pt-4 mt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {t('Current reservations')}
            </p>
            <div className="space-y-1.5">
              {slotReservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-1.5">
                  <div className="flex items-center gap-3">
                    {r.horse && (
                      <span className="flex items-center gap-1">
                        <span>🐴</span>
                        <span className="font-medium">{r.horse.name}</span>
                      </span>
                    )}
                    {canReserveForOthers && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        {r.user.name}
                        {r.user_id === authUserId && <span className="text-xs text-primary font-medium">({t('me')})</span>}
                      </span>
                    )}
                    {!canReserveForOthers && r.user_id === authUserId && (
                      <span className="text-xs text-primary font-medium">({t('me')})</span>
                    )}
                  </div>
                  {(r.user_id === authUserId || canReserveForOthers) && (
                    <button onClick={() => onCancel(r)} className="text-red-400 hover:text-red-600 transition-colors">
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
  );
}
