/** Where the booking has got to. */
export type BookingStatus = 'booked' | 'played' | 'cancelled';

export const BOOKING_STATUSES: BookingStatus[] = ['booked', 'played', 'cancelled'];

export interface Booking {
  id: number;
  memberId: number;
  /** The day of the round. */
  onDay: string;
  /** The time off the first tee, HH:MM. */
  teeTime: string;
  /** How many holes are booked. */
  holes: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRow {
  id: number;
  member_id: number;
  on_day: string;
  tee_time: string;
  holes: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingDraft {
  onDay: string;
  teeTime: string;
  holes: number;
}

export interface NewBooking extends BookingDraft {
  memberId: number;
}
