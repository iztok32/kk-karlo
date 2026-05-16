import { parseISO, isBefore, isAfter } from 'date-fns';

export interface Teacher {
  id: number;
  name: string;
}

export interface Appointment {
  id: number;
  name: string;
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
  horse: { id: number; name: string };
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

export function appointmentOnDate(appt: Appointment, date: Date): boolean {
  const dayKey = DAY_KEYS[date.getDay()];
  if (!appt[dayKey]) return false;
  if (appt.valid_from && isBefore(date, parseISO(appt.valid_from))) return false;
  if (appt.valid_to && isAfter(date, parseISO(appt.valid_to))) return false;
  return true;
}

export function formatTime(time: string | null): string {
  if (!time) return '';
  return time.substring(0, 5);
}
