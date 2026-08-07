export interface Guest {
  id: number;
  bookingId: number;
  /** The guest's name for the sheet. */
  name: string;
  /** What the guest is charged to play, in whole pence. */
  greenFeePence: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuestRow {
  id: number;
  booking_id: number;
  name: string;
  green_fee_pence: number;
  created_at: string;
  updated_at: string;
}

export interface GuestDraft {
  name: string;
  greenFeePence: number;
}

export interface NewGuest extends GuestDraft {
  bookingId: number;
}
