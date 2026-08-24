export interface VisitorRound {
  id: number;
  clubId: number;
  /** Who played. */
  visitorName: string;
  /** The day they played. */
  onDay: string;
  /** How many holes they played. */
  holes: number;
  /** The green fee taken, in whole pence. */
  feePence: number;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorRoundRow {
  id: number;
  club_id: number;
  visitor_name: string;
  on_day: string;
  holes: number;
  fee_pence: number;
  created_at: string;
  updated_at: string;
}

export interface VisitorRoundDraft {
  visitorName: string;
  onDay: string;
  holes: number;
  feePence: number;
}

export interface NewVisitorRound extends VisitorRoundDraft {
  clubId: number;
}
