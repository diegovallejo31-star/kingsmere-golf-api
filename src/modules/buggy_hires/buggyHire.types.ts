export interface BuggyHire {
  id: number;
  bookingId: number;
  /** The buggy's fleet number. */
  buggyRef: string;
  /** What the buggy is charged at, in whole pence. */
  feePence: number;
  createdAt: string;
  updatedAt: string;
}

export interface BuggyHireRow {
  id: number;
  booking_id: number;
  buggy_ref: string;
  fee_pence: number;
  created_at: string;
  updated_at: string;
}

export interface BuggyHireDraft {
  buggyRef: string;
  feePence: number;
}

export interface NewBuggyHire extends BuggyHireDraft {
  bookingId: number;
}
