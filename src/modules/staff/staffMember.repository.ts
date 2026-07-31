import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type {
  NewStaffMember,
  StaffMember,
  StaffMemberPatch,
  StaffMemberRow,
} from './staffMember.types';

export function toStaffMember(row: StaffMemberRow): StaffMember {
  return {
    id: row.id,
    clubId: row.club_id,
    payrollNumber: row.payroll_number,
    name: row.name,
    role: row.role,
    startedOn: row.started_on,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface StaffMemberFilter {
  payrollNumber?: string;
}

export class StaffMemberRepository {
  constructor(private readonly db: Database) {}

  create(input: NewStaffMember): StaffMember {
    const row = this.db
      .prepare(
        `INSERT INTO staff (club_id, payroll_number, name, role, started_on)
         VALUES (?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.clubId,
        input.payrollNumber,
        input.name,
        input.role,
        input.startedOn,
      ) as unknown as StaffMemberRow;
    return toStaffMember(row);
  }

  findById(id: number): StaffMember | null {
    const row = this.db.prepare('SELECT * FROM staff WHERE id = ?').get(id) as unknown as
      StaffMemberRow | undefined;
    return row ? toStaffMember(row) : null;
  }

  findByPayrollNumber(clubId: number, payrollNumber: string): StaffMember | null {
    const row = this.db
      .prepare('SELECT * FROM staff WHERE club_id = ? AND payroll_number = ?')
      .get(clubId, payrollNumber) as unknown as StaffMemberRow | undefined;
    return row ? toStaffMember(row) : null;
  }

  list(clubId: number, page: Page, filter: StaffMemberFilter = {}): StaffMember[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('club_id = ?');
    args.push(clubId);
    if (filter.payrollNumber !== undefined) {
      clauses.push('payroll_number = ?');
      args.push(filter.payrollNumber);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM staff ${where} ORDER BY payroll_number ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as StaffMemberRow[];
    return rows.map(toStaffMember);
  }

  update(id: number, patch: StaffMemberPatch): StaffMember | null {
    const current = this.findById(id);
    if (!current) return null;

    const row = this.db
      .prepare(`UPDATE staff SET role = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(patch.role ?? current.role, id) as unknown as StaffMemberRow;
    return toStaffMember(row);
  }

  count(clubId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM staff WHERE club_id = ?')
      .get(clubId) as unknown as { n: number };
    return row.n;
  }
}
