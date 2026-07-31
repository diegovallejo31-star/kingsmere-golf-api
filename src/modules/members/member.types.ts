export interface Member {
  id: number;
  /** The membership number on the card. */
  memberRef: string;
  name: string;
  email: string | null;
  /** The day they joined the club. */
  joinedOn: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberRow {
  id: number;
  member_ref: string;
  name: string;
  email: string | null;
  joined_on: string;
  created_at: string;
  updated_at: string;
}

export interface MemberDraft {
  memberRef: string;
  name: string;
  email?: string;
  joinedOn: string;
}

export type NewMember = MemberDraft;

export interface MemberPatch {
  email?: string;
}
