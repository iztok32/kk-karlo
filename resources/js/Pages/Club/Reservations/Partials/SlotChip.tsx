import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/Components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/tooltip';
import { Bell, Clock, Mail, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Appointment, AppointmentTypeItem, Reservation, formatTime, getTypeColorEntry } from '../types';

interface SlotChipProps {
  appointment: Appointment;
  appointmentTypes: AppointmentTypeItem[];
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

export default function SlotChip({
  appointment,
  appointmentTypes,
  reservations,
  authUserId,
  onClick,
  compact = false,
  disabled = false,
  disabledReason,
  isTeacherSlot = false,
  canNotify = false,
  enabledChannels = [],
  onNotify,
}: SlotChipProps) {
  const count = reservations.length;
  const capacity = appointment.capacity;
  const isFull = capacity !== null && count >= capacity;
  const isNearFull = capacity !== null && count / capacity >= 0.7;
  const userHasReservation = reservations.some((r) => r.user_id === authUserId);
  const isDisabled = disabled || (isFull && !userHasReservation);

  const colors = getTypeColorEntry(appointment.type, appointmentTypes);

  const colorClass = disabled
    ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-70'
    : isFull && !userHasReservation
    ? colors.full
    : isNearFull
    ? colors.medium
    : colors.normal;

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
            <span className={cn('inline-block w-1.5 h-1.5 rounded-full shrink-0', colors.dot)} />
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
                <span key={r.id} className="truncate opacity-80">{r.horse ? `🐴 ${r.horse.name}` : r.user.name}</span>
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
          <p key={r.id} className="text-xs">{r.horse ? `🐴 ${r.horse.name} – ` : ''}{r.user.name}</p>
        ))}
        {userHasReservation && <p className="text-xs font-medium">✓ Imate rezervacijo</p>}
        {isTeacherSlot && <p className="text-xs opacity-70">★ Vaš termin</p>}
        {disabledReason && <p className="text-xs text-amber-300 mt-1">⚠ {disabledReason}</p>}
      </TooltipContent>
    </Tooltip>
  ) : (
    <button
      onClick={isDisabled ? undefined : onClick}
      className={cn(
        'w-full text-left px-2.5 py-2 rounded-lg border transition-colors',
        colorClass,
        isDisabled ? 'cursor-default' : 'cursor-pointer',
      )}
    >
      {/* Header: ura + ime + zaseditev */}
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={cn('inline-block w-2 h-2 rounded-full shrink-0', colors.dot)} />
            {appointment.start_time && (
              <span className="text-xs font-bold leading-tight">
                <Clock className="inline w-3 h-3 mr-0.5 opacity-70" />
                {formatTime(appointment.start_time)}
                {appointment.end_time && `–${formatTime(appointment.end_time)}`}
                {isTeacherSlot && <span className="ml-1 opacity-50 text-[10px]">★</span>}
              </span>
            )}
          </div>
          <div className="text-xs font-medium leading-tight break-words">
            {appointment.name}
          </div>
        </div>
        <span className="text-xs font-bold shrink-0 whitespace-nowrap pl-1">
          {isFull ? 'POLNO' : `${count}/${capacity ?? '∞'}`}
          {userHasReservation && ' ✓'}
        </span>
      </div>

      {/* Seznam rezervacij */}
      {reservations.length > 0 && (
        <div className="mt-1.5 pt-1.5 border-t border-current/20 space-y-0.5">
          {reservations.map((r) => (
            <div
              key={r.id}
              className={cn(
                'text-xs leading-snug',
                r.user_id === authUserId ? 'font-semibold' : 'opacity-75',
              )}
            >
              {r.horse ? `🐴 ${r.horse.name} · ` : ''}{r.user.name}
            </div>
          ))}
        </div>
      )}

      {/* Opozorilo za omejitev */}
      {disabledReason && (
        <div className="mt-1 text-[10px] opacity-70">⚠ {disabledReason}</div>
      )}
    </button>
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
