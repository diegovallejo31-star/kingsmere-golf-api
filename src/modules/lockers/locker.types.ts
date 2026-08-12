/** Whether the locker is spoken for. */
export type LockerStatus = 'vacant' | 'let';

export const LOCKER_STATUSES: LockerStatus[] = ['vacant', 'let'];

export interface Locker {
  id: number;
  clubId: number;
  /** The number on the locker door, unique within the club. */
  lockerNumber: string;
  /** A year's rent for the locker, in whole pence. */
  annualRentPence: number;
  status: LockerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LockerRow {
  id: number;
  club_id: number;
  locker_number: string;
  annual_rent_pence: number;
  status: LockerStatus;
  created_at: string;
  updated_at: string;
}

export interface LockerDraft {
  lockerNumber: string;
  annualRentPence: number;
}

export interface NewLocker extends LockerDraft {
  clubId: number;
}

export interface LockerPatch {
  annualRentPence?: number;
}
