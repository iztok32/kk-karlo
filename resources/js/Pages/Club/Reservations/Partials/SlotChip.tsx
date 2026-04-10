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
import { Appointment, Reservation, formatTime } from '../types';

interface SlotChipProps {
  appointment: Appointment;
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
