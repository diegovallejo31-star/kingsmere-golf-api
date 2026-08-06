import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Booking, BookingRow, BookingStatus, NewBooking } from './booking.types';

export function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    memberId: row.member_id,
    onDay: row.on_day,
    teeTime: row.tee_time,
    holes: row.holes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface BookingFilter {
  status?: BookingStatus;
}

export class BookingRepository {
  constructor(private readonly db: Database) {}

  create(input: NewBooking): Booking {
    const row = this.db
      .prepare(
        `INSERT INTO bookings (member_id, on_day, tee_time, holes)
         VALUES (?, ?, ?, ?) RETURNING *`,
      )
      .get(input.memberId, input.onDay, input.teeTime, input.holes) as unknown as BookingRow;
    return toBooking(row);
  }

  findById(id: number): Booking | null {
    const row = this.db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as unknown as
      BookingRow | undefined;
    return row ? toBooking(row) : null;
  }

  list(memberId: number, page: Page, filter: BookingFilter = {}): Booking[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('member_id = ?');
    args.push(memberId);
    if (filter.status) {
      clauses.push('status = ?');
      args.push(filter.status);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM bookings ${where} ORDER BY on_day DESC, tee_time DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as BookingRow[];
    return rows.map(toBooking);
  }

  setStatus(id: number, next: BookingStatus): Booking | null {
    const row = this.db
      .prepare(`UPDATE bookings SET status = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(next, id) as unknown as BookingRow | undefined;
    return row ? toBooking(row) : null;
  }

  count(memberId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM bookings WHERE member_id = ?')
      .get(memberId) as unknown as { n: number };
    return row.n;
  }
}
