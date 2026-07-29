export interface Club {
  id: number;
  /** Short club code. */
  code: string;
  name: string;
  /** Where the course is. */
  town: string;
  /** How many holes the course plays. */
  holes: number;
  /** The day the club was founded. */
  foundedOn: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClubRow {
  id: number;
  code: string;
  name: string;
  town: string;
  holes: number;
  founded_on: string;
  created_at: string;
  updated_at: string;
}

export interface ClubDraft {
  code: string;
  name: string;
  town: string;
  holes: number;
  foundedOn: string;
}

export type NewClub = ClubDraft;
