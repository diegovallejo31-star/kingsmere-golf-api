/** Whether the rental is still running. */
export type RentalStatus = 'active' | 'ended';

export const RENTAL_STATUSES: RentalStatus[] = ['active', 'ended'];

export interface Rental {
  id: number;
  memberId: number;
  /** The locker being taken. */
  lockerId: number;
  /** The day the rental started. */
  takenOn: string;
  /** The rent charged, copied from the locker when the rental was taken. */
  rentPence: number;
  status: RentalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RentalRow {
  id: number;
  member_id: number;
  locker_id: number;
  taken_on: string;
  rent_pence: number;
  status: RentalStatus;
  created_at: string;
  updated_at: string;
}

export interface RentalDraft {
  lockerId: number;
  takenOn: string;
}

export interface NewRental extends RentalDraft {
  memberId: number;
  rentPence: number;
}
