/** Whether the entry still stands. */
export type EntryStatus = 'entered' | 'withdrawn';

export const ENTRY_STATUSES: EntryStatus[] = ['entered', 'withdrawn'];

export interface Entry {
  id: number;
  competitionId: number;
  /** The member entering. */
  memberId: number;
  /** What the entry was charged, fixed when it was taken. */
  feePence: number;
  status: EntryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EntryRow {
  id: number;
  competition_id: number;
  member_id: number;
  fee_pence: number;
  status: EntryStatus;
  created_at: string;
  updated_at: string;
}

export interface EntryDraft {
  memberId: number;
}

export interface NewEntry extends EntryDraft {
  competitionId: number;
  feePence: number;
}
