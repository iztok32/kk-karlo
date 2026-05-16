import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { useForm, Head, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import {
  format,
  parseISO,
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
  differenceInDays,
} from 'date-fns';
import { sl, enGB, hr, it, de } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Appointment,
  Reservation,
  ReservationWithAppointment,
  HorseItem,
  UserItem,
  ReservationLimits,
  NotifySlot,
  LateCancelInfo,
  Teacher,
  Holiday,
} from './types';
import CalendarViews from './Partials/CalendarViews';
import UpcomingReservations from './Partials/UpcomingReservations';
import ReservationDialog from './Partials/ReservationDialog';
import NotifySlotDialog from './Partials/NotifySlotDialog';
import ConfirmCancelDialog from './Partials/ConfirmCancelDialog';
import LateCancellationDialog from './Partials/LateCancellationDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  appointments: Appointment[];
  reservations: Reservation[];
  holidays: Holiday[];
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
  defaultAdmins: Teacher[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LOCALE_MAP: Record<string, Locale> = { sl, en: enGB, hr, it, de };

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
  return {
    start: format(startOfWeek(startOfMonth(date), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(endOfMonth(date), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Index({
  appointments,
  reservations,
  holidays = [],
  horses,
  users,
  canReserveForOthers,
  startDate,
  currentView,
  authUserId,
  myUpcoming,
  reservationLimits = { minDaysInAdvance: 0, maxDaysInAdvance: null, cancellationDays: null, isAdmin: false },
  canNotifySlots = false,
  myTeacherAppointmentIds = [],
  enabledChannels = [],
  defaultAdmins = [],
}: Props) {
  const { t, locale } = useTranslation();
  const dateFnsLocale = LOCALE_MAP[locale] ?? sl;

  const [view, setView] = useState<'month' | 'week' | 'day'>(
    (currentView as 'month' | 'week' | 'day') || 'month',
  );
  const [anchorDate, setAnchorDate] = useState<Date>(() => parseISO(startDate));

  // ── Reservation form ────────────────────────────────────────────────────────
  const [selectedSlot, setSelectedSlot] = useState<{ appointment: Appointment; date: Date } | null>(null);
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

  // ── Notify slot form ────────────────────────────────────────────────────────
  const [notifySlot, setNotifySlot] = useState<NotifySlot | null>(null);
  const { data: notifyData, setData: setNotifyData, post: postNotify, processing: notifyProcessing, reset: resetNotify, errors: notifyErrors } = useForm({
    subject: '',
    message: '',
    recipient_ids: [] as number[],
    send_to_all: false,
  });

  // ── Confirm cancel ──────────────────────────────────────────────────────────
  const [confirmCancel, setConfirmCancel] = useState<Reservation | ReservationWithAppointment | null>(null);

  // ── Late cancellation ───────────────────────────────────────────────────────
  const [lateCancelInfo, setLateCancelInfo] = useState<LateCancelInfo | null>(null);
  const { post: postLateCancellation, processing: lateCancelProcessing } = useForm({});

  // ── Calendar days ───────────────────────────────────────────────────────────
  const calendarDays = useMemo<Date[]>(() => {
    if (view === 'week') {
      return eachDayOfInterval({
        start: startOfWeek(anchorDate, { weekStartsOn: 1 }),
        end: endOfWeek(anchorDate, { weekStartsOn: 1 }),
      });
    }
    if (view === 'day') return [anchorDate];
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(anchorDate), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(anchorDate), { weekStartsOn: 1 }),
    });
  }, [anchorDate, view]);

  const periodLabel = useMemo(() => {
    if (view === 'month') return format(anchorDate, 'LLLL yyyy', { locale: dateFnsLocale });
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

  // ── Derived slot reservations ───────────────────────────────────────────────
  const selectedSlotReservations: Reservation[] = useMemo(() => {
    if (!selectedSlot) return [];
    const dateStr = format(selectedSlot.date, 'yyyy-MM-dd');
    return reservations.filter(
      r => r.appointment_id === selectedSlot.appointment.id && r.reservation_date.slice(0, 10) === dateStr,
    );
  }, [selectedSlot, reservations]);

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
    router.get(route('reservations.index'), { start, end, view }, { preserveState: true, preserveScroll: true });
  }

  function goToToday() {
    const today = new Date();
    setAnchorDate(today);
    const { start, end } = getDateRange(today, view);
    router.get(route('reservations.index'), { start, end, view }, { preserveState: true, preserveScroll: true });
  }

  function switchView(newView: 'month' | 'week' | 'day') {
    setView(newView);
    const { start, end } = getDateRange(anchorDate, newView);
    router.get(route('reservations.index'), { start, end, view: newView }, { preserveState: true, preserveScroll: true });
  }

  // ── Reservation handlers ────────────────────────────────────────────────────
  function openSlot(appointment: Appointment, date: Date) {
    setSelectedSlot({ appointment, date });
    setData({ appointment_id: appointment.id, horse_id: '', user_id: String(authUserId), reservation_date: format(date, 'yyyy-MM-dd'), notes: '' });
    clearErrors();
  }

  function closeDialog() {
    setSelectedSlot(null);
    reset();
    clearErrors();
  }

  function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    post(route('reservations.store'), { onSuccess: () => closeDialog() });
  }

  // ── Notify handlers ─────────────────────────────────────────────────────────
  function openNotifyDialog(appointment: Appointment, date: Date, channel: 'portal' | 'email' | 'sms') {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slotRes = reservations.filter(
      r => r.appointment_id === appointment.id && r.reservation_date.slice(0, 10) === dateStr,
    );
    const recipientIds = slotRes.map(r => r.user_id);
    const dateFmtStr = format(date, 'EEEE, d. MMMM yyyy', { locale: dateFnsLocale });
    const timeStr = appointment.start_time
      ? `${appointment.start_time.substring(0, 5)}${appointment.end_time ? ` – ${appointment.end_time.substring(0, 5)}` : ''}`
      : '';
    const defaultSubject = `${appointment.name}${timeStr ? ` – ${timeStr}` : ''} – ${dateFmtStr}`;
    const defaultMessage = `${appointment.name}\n${timeStr ? `Ura: ${timeStr}\n` : ''}Datum: ${dateFmtStr}\n\n`;
    setNotifySlot({ appointment, date, channel, recipientIds });
    setNotifyData({ subject: defaultSubject, message: defaultMessage, recipient_ids: recipientIds, send_to_all: false });
  }

  function closeNotifyDialog() {
    setNotifySlot(null);
    resetNotify();
  }

  function handleNotifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notifySlot) return;
    const routeMap = { portal: 'notifications.send-portal', email: 'notifications.send-email', sms: 'notifications.send-sms' };
    postNotify(route(routeMap[notifySlot.channel]), { onSuccess: () => closeNotifyDialog(), preserveScroll: true });
  }

  // ── Cancel handlers ─────────────────────────────────────────────────────────
  function handleCancel(reservation: Reservation | ReservationWithAppointment) {
    const { cancellationDays, isAdmin } = reservationLimits;
    if (!isAdmin && cancellationDays !== null) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntil = differenceInDays(parseISO(reservation.reservation_date), today);
      if (daysUntil < cancellationDays) {
        const appointmentName = 'appointment' in reservation
          ? reservation.appointment.name
          : (appointments.find(a => a.id === reservation.appointment_id)?.name ?? '');
        setLateCancelInfo({
          id: reservation.id,
          appointmentId: 'appointment' in reservation ? reservation.appointment.id : reservation.appointment_id,
          appointmentName,
          reservationDate: reservation.reservation_date,
        });
        return;
      }
    }
    setConfirmCancel(reservation);
  }

  function doCancel() {
    if (!confirmCancel) return;
    router.delete(route('reservations.destroy', confirmCancel.id), {
      preserveScroll: true,
      onSuccess: () => setConfirmCancel(null),
      onError: () => setConfirmCancel(null),
    });
  }

  function handleSendLateCancellationNotification() {
    if (!lateCancelInfo) return;
    postLateCancellation(route('reservations.notify-late-cancellation', lateCancelInfo.id), {
      preserveScroll: true,
      onSuccess: () => setLateCancelInfo(null),
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AuthenticatedLayout header={t('Reservations')}>
      <Head title={t('Reservations')} />

      <div className="flex flex-col h-full min-h-0 gap-4 p-4 lg:p-6">
        {/* Header toolbar */}
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
          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-muted">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => switchView(v)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors font-medium',
                  view === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {v === 'month' ? t('Month') : v === 'week' ? t('Week') : t('Day')}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 border border-border rounded-xl bg-background overflow-hidden flex flex-col min-h-[400px]">
          <CalendarViews
            view={view}
            anchorDate={anchorDate}
            calendarDays={calendarDays}
            appointments={appointments}
            reservations={reservations}
            holidays={holidays}
            authUserId={authUserId}
            reservationLimits={reservationLimits}
            myTeacherAppointmentIds={myTeacherAppointmentIds}
            canNotifySlots={canNotifySlots}
            canReserveForOthers={canReserveForOthers}
            enabledChannels={enabledChannels}
            dateFnsLocale={dateFnsLocale}
            onOpenSlot={openSlot}
            onCancel={handleCancel}
            onNotify={openNotifyDialog}
          />
        </div>

        {/* Upcoming reservations */}
        <UpcomingReservations
          reservations={myUpcoming}
          dateFnsLocale={dateFnsLocale}
          onCancel={handleCancel}
        />
      </div>

      {/* Dialogs */}
      <ReservationDialog
        open={!!selectedSlot}
        slot={selectedSlot}
        slotReservations={selectedSlotReservations}
        horses={horses}
        users={users}
        authUserId={authUserId}
        canReserveForOthers={canReserveForOthers}
        reservationLimits={reservationLimits}
        dateFnsLocale={dateFnsLocale}
        formData={data}
        errors={errors}
        processing={processing}
        onClose={closeDialog}
        onSubmit={handleReserve}
        onFieldChange={(field, value) => setData(field as keyof typeof data, value as never)}
        onCancel={handleCancel}
      />

      <NotifySlotDialog
        notifySlot={notifySlot}
        users={users}
        dateFnsLocale={dateFnsLocale}
        formData={notifyData}
        errors={notifyErrors}
        processing={notifyProcessing}
        onClose={closeNotifyDialog}
        onSubmit={handleNotifySubmit}
        onFieldChange={(field, value) => setNotifyData(field as keyof typeof notifyData, value as never)}
      />

      <ConfirmCancelDialog
        reservation={confirmCancel}
        appointments={appointments}
        dateFnsLocale={dateFnsLocale}
        onClose={() => setConfirmCancel(null)}
        onConfirm={doCancel}
      />

      <LateCancellationDialog
        lateCancelInfo={lateCancelInfo}
        appointments={appointments}
        defaultAdmins={defaultAdmins}
        dateFnsLocale={dateFnsLocale}
        processing={lateCancelProcessing}
        onClose={() => setLateCancelInfo(null)}
        onSend={handleSendLateCancellationNotification}
      />
    </AuthenticatedLayout>
  );
}
