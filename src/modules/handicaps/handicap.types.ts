export interface Handicap {
  id: number;
  memberId: number;
  /** The day this handicap took effect. */
  recordedOn: string;
  /** The exact handicap in tenths - 124 is 12.4, up to 54.0. */
  exactTenths: number;
  /** Why it changed - a cut, a general play review, a new member. */
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface HandicapRow {
  id: number;
  member_id: number;
  recorded_on: string;
  exact_tenths: number;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface HandicapDraft {
  recordedOn: string;
  exactTenths: number;
  reason: string;
}

export interface NewHandicap extends HandicapDraft {
  memberId: number;
}
