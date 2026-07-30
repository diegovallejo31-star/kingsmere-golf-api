export interface StaffMember {
  id: number;
  clubId: number;
  /** Payroll number, unique within the club. */
  payrollNumber: string;
  name: string;
  /** What they do at the club. */
  role: 'professional' | 'secretary' | 'greens' | 'bar';
  /** First day on the payroll. */
  startedOn: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMemberRow {
  id: number;
  club_id: number;
  payroll_number: string;
  name: string;
  role: 'professional' | 'secretary' | 'greens' | 'bar';
  started_on: string;
  created_at: string;
  updated_at: string;
}

export interface StaffMemberDraft {
  payrollNumber: string;
  name: string;
  role: 'professional' | 'secretary' | 'greens' | 'bar';
  startedOn: string;
}

export interface NewStaffMember extends StaffMemberDraft {
  clubId: number;
}

export interface StaffMemberPatch {
  role?: 'professional' | 'secretary' | 'greens' | 'bar';
}
