import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { NewRental, Rental, RentalRow, RentalStatus } from './rental.types';

export function toRental(row: RentalRow): Rental {
  return {
    id: row.id,
    memberId: row.member_id,
    lockerId: row.locker_id,
    takenOn: row.taken_on,
    rentPence: row.rent_pence,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface RentalFilter {
  status?: RentalStatus;
  lockerId?: number;
}

export class RentalRepository {
  constructor(private readonly db: Database) {}

  create(input: NewRental): Rental {
    const row = this.db
      .prepare(
        `INSERT INTO rentals (member_id, locker_id, taken_on, rent_pence)
         VALUES (?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.memberId,
        input.lockerId,
        input.takenOn,
        input.rentPence,
      ) as unknown as RentalRow;
    return toRental(row);
  }

  findById(id: number): Rental | null {
    const row = this.db.prepare('SELECT * FROM rentals WHERE id = ?').get(id) as unknown as
      RentalRow | undefined;
    return row ? toRental(row) : null;
  }

  list(memberId: number, page: Page, filter: RentalFilter = {}): Rental[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('member_id = ?');
    args.push(memberId);
    if (filter.status) {
      clauses.push('status = ?');
      args.push(filter.status);
    }
    if (filter.lockerId !== undefined) {
      clauses.push('locker_id = ?');
      args.push(filter.lockerId);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM rentals ${where} ORDER BY taken_on DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as RentalRow[];
    return rows.map(toRental);
  }

  setStatus(id: number, next: RentalStatus): Rental | null {
    const row = this.db
      .prepare(`UPDATE rentals SET status = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(next, id) as unknown as RentalRow | undefined;
    return row ? toRental(row) : null;
  }

  count(memberId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM rentals WHERE member_id = ?')
      .get(memberId) as unknown as { n: number };
    return row.n;
  }
}
