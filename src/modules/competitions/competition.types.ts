export interface Competition {
  id: number;
  clubId: number;
  /** What the competition is called. */
  name: string;
  /** The day it is played. */
  onDay: string;
  /** How it is scored. */
  format: 'medal' | 'stableford' | 'matchplay';
  /** What it costs to enter, in whole pence. */
  entryFeePence: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionRow {
  id: number;
  club_id: number;
  name: string;
  on_day: string;
  format: 'medal' | 'stableford' | 'matchplay';
  entry_fee_pence: number;
  created_at: string;
  updated_at: string;
}

export interface CompetitionDraft {
  name: string;
  onDay: string;
  format: 'medal' | 'stableford' | 'matchplay';
  entryFeePence: number;
}

export interface NewCompetition extends CompetitionDraft {
  clubId: number;
}

export interface CompetitionPatch {
  entryFeePence?: number;
}
