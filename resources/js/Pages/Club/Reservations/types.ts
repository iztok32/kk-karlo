import { format } from 'date-fns';

export interface Teacher {
  id: number;
  name: string;
}

export interface Appointment {
  id: number;
  name: string;
  type: number;
  valid_from: string | null;
  valid_to: string | null;
  day_monday: boolean;
  day_tuesday: boolean;
  day_wednesday: boolean;
  day_thursday: boolean;
  day_friday: boolean;
  day_saturday: boolean;
  day_sunday: boolean;
  start_time: string | null;
  end_time: string | null;
  capacity: number | null;
  is_active: boolean;
  teachers: Teacher[];
}

export interface AppointmentTypeItem {
  id: number;
  name: string;
  horses_selectable: boolean;
  coupon_type_id: number | null;
}

export const TYPE_COLOR_PALETTE = [
  { dot: 'bg-sky-500',    normal: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',       medium: 'bg-sky-100 text-sky-700 border-sky-200',       full: 'bg-sky-100 text-sky-700 border-sky-200 opacity-80'    },
  { dot: 'bg-violet-500', normal: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100', medium: 'bg-violet-100 text-violet-700 border-violet-200', full: 'bg-violet-100 text-violet-700 border-violet-200 opacity-80' },
  { dot: 'bg-rose-500',   normal: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',   medium: 'bg-rose-100 text-rose-700 border-rose-200',     full: 'bg-rose-100 text-rose-700 border-rose-200 opacity-80'   },
  { dot: 'bg-teal-500',   normal: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',   medium: 'bg-teal-100 text-teal-700 border-teal-200',     full: 'bg-teal-100 text-teal-700 border-teal-200 opacity-80'   },
  { dot: 'bg-amber-500',  normal: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', medium: 'bg-amber-100 text-amber-700 border-amber-200', full: 'bg-amber-100 text-amber-700 border-amber-200 opacity-80'  },
  { dot: 'bg-orange-500', normal: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100', medium: 'bg-orange-100 text-orange-700 border-orange-200', full: 'bg-orange-100 text-orange-700 border-orange-200 opacity-80' },
];

export function getTypeColorEntry(typeId: number, appointmentTypes: AppointmentTypeItem[]) {
  const idx = appointmentTypes.findIndex(t => t.id === typeId);
  return TYPE_COLOR_PALETTE[(idx >= 0 ? idx : 0) % TYPE_COLOR_PALETTE.length];
}

export interface Reservation {
  id: number;
  appointment_id: number;
  horse_id: number;
  user_id: number;
  reservation_date: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by_user_id: number | null;
  horse: { id: number; name: string } | null;
  user: { id: number; name: string };
  created_by: { id: number; name: string } | null;
}

export interface ReservationWithAppointment extends Reservation {
  appointment: Appointment;
}

export interface Holiday {
  date: string;        // 'yyyy-MM-dd'
  name: string;
  local_name: string | null;
  country_code: string;
}

export interface HorseItem {
  id: number;
  name: string;
}

export interface UserItem {
  id: number;
  name: string;
}

export interface ReservationLimits {
  minDaysInAdvance: number;
  maxDaysInAdvance: number | null;
  cancellationDays: number | null;
  isAdmin: boolean;
}

export interface NotifySlot {
  appointment: Appointment;
  date: Date;
  channel: 'portal' | 'email' | 'sms';
  recipientIds: number[];
}

export interface LateCancelInfo {
  id: number;
  appointmentId: number;
  appointmentName: string;
  reservationDate: string;
}

export const DAY_KEYS: (keyof Appointment)[] = [
  'day_sunday',
  'day_monday',
  'day_tuesday',
  'day_wednesday',
  'day_thursday',
  'day_friday',
  'day_saturday',
];

/** Day-of-week match only — ignores valid_from/to. Use for week/month views. */
export function appointmentOccursOnDay(appt: Appointment, date: Date): boolean {
  const dayKey = DAY_KEYS[date.getDay()];
  return !!appt[dayKey];
}

/** Is the date within the appointment's validity range? Uses string comparison to avoid timezone issues. */
export function appointmentValidOnDate(appt: Appointment, date: Date): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  if (appt.valid_from && dateStr < appt.valid_from) return false;
  if (appt.valid_to && dateStr > appt.valid_to) return false;
  return true;
}

/** Full check: day-of-week + validity range. */
export function appointmentOnDate(appt: Appointment, date: Date): boolean {
  return appointmentOccursOnDay(appt, date) && appointmentValidOnDate(appt, date);
}

export function formatTime(time: string | null): string {
  if (!time) return '';
  return time.substring(0, 5);
}
