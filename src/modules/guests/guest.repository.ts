import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Guest, GuestRow, NewGuest } from './guest.types';

export function toGuest(row: GuestRow): Guest {
  return {
    id: row.id,
    bookingId: row.booking_id,
    name: row.name,
    greenFeePence: row.green_fee_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Nothing to narrow a list of these by yet. */
export type GuestFilter = Record<string, never>;

export class GuestRepository {
  constructor(private readonly db: Database) {}

  create(input: NewGuest): Guest {
    const row = this.db
      .prepare(
        `INSERT INTO guests (booking_id, name, green_fee_pence)
         VALUES (?, ?, ?) RETURNING *`,
      )
      .get(input.bookingId, input.name, input.greenFeePence) as unknown as GuestRow;
    return toGuest(row);
  }

  findById(id: number): Guest | null {
    const row = this.db.prepare('SELECT * FROM guests WHERE id = ?').get(id) as unknown as
      GuestRow | undefined;
    return row ? toGuest(row) : null;
  }

  list(bookingId: number, page: Page, _filter: GuestFilter = {}): Guest[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('booking_id = ?');
    args.push(bookingId);
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM guests ${where} ORDER BY id ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as GuestRow[];
    return rows.map(toGuest);
  }

  count(bookingId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM guests WHERE booking_id = ?')
      .get(bookingId) as unknown as { n: number };
    return row.n;
  }
}
