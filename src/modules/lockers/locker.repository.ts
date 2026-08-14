import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Locker, LockerPatch, LockerRow, LockerStatus, NewLocker } from './locker.types';

export function toLocker(row: LockerRow): Locker {
  return {
    id: row.id,
    clubId: row.club_id,
    lockerNumber: row.locker_number,
    annualRentPence: row.annual_rent_pence,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface LockerFilter {
  status?: LockerStatus;
  lockerNumber?: string;
}

export class LockerRepository {
  constructor(private readonly db: Database) {}

  create(input: NewLocker): Locker {
    const row = this.db
      .prepare(
        `INSERT INTO lockers (club_id, locker_number, annual_rent_pence)
         VALUES (?, ?, ?) RETURNING *`,
      )
      .get(input.clubId, input.lockerNumber, input.annualRentPence) as unknown as LockerRow;
    return toLocker(row);
  }

  findById(id: number): Locker | null {
    const row = this.db.prepare('SELECT * FROM lockers WHERE id = ?').get(id) as unknown as
      LockerRow | undefined;
    return row ? toLocker(row) : null;
  }

  findByLockerNumber(clubId: number, lockerNumber: string): Locker | null {
    const row = this.db
      .prepare('SELECT * FROM lockers WHERE club_id = ? AND locker_number = ?')
      .get(clubId, lockerNumber) as unknown as LockerRow | undefined;
    return row ? toLocker(row) : null;
  }

  list(clubId: number, page: Page, filter: LockerFilter = {}): Locker[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('club_id = ?');
    args.push(clubId);
    if (filter.status) {
      clauses.push('status = ?');
      args.push(filter.status);
    }
    if (filter.lockerNumber !== undefined) {
      clauses.push('locker_number = ?');
      args.push(filter.lockerNumber);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM lockers ${where} ORDER BY locker_number ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as LockerRow[];
    return rows.map(toLocker);
  }

  update(id: number, patch: LockerPatch): Locker | null {
    const current = this.findById(id);
    if (!current) return null;

    const row = this.db
      .prepare(`UPDATE lockers SET annual_rent_pence = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(patch.annualRentPence ?? current.annualRentPence, id) as unknown as LockerRow;
    return toLocker(row);
  }

  setStatus(id: number, next: LockerStatus): Locker | null {
    const row = this.db
      .prepare(`UPDATE lockers SET status = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(next, id) as unknown as LockerRow | undefined;
    return row ? toLocker(row) : null;
  }

  count(clubId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM lockers WHERE club_id = ?')
      .get(clubId) as unknown as { n: number };
    return row.n;
  }
}
