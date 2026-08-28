import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { BuggyHire, BuggyHireRow, NewBuggyHire } from './buggyHire.types';

export function toBuggyHire(row: BuggyHireRow): BuggyHire {
  return {
    id: row.id,
    bookingId: row.booking_id,
    buggyRef: row.buggy_ref,
    feePence: row.fee_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface BuggyHireFilter {
  buggyRef?: string;
}

export class BuggyHireRepository {
  constructor(private readonly db: Database) {}

  create(input: NewBuggyHire): BuggyHire {
    const row = this.db
      .prepare(
        `INSERT INTO buggy_hires (booking_id, buggy_ref, fee_pence)
         VALUES (?, ?, ?) RETURNING *`,
      )
      .get(input.bookingId, input.buggyRef, input.feePence) as unknown as BuggyHireRow;
    return toBuggyHire(row);
  }

  findById(id: number): BuggyHire | null {
    const row = this.db.prepare('SELECT * FROM buggy_hires WHERE id = ?').get(id) as unknown as
      BuggyHireRow | undefined;
    return row ? toBuggyHire(row) : null;
  }

  list(bookingId: number, page: Page, filter: BuggyHireFilter = {}): BuggyHire[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('booking_id = ?');
    args.push(bookingId);
    if (filter.buggyRef !== undefined) {
      clauses.push('buggy_ref = ?');
      args.push(filter.buggyRef);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM buggy_hires ${where} ORDER BY id ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as BuggyHireRow[];
    return rows.map(toBuggyHire);
  }

  count(bookingId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM buggy_hires WHERE booking_id = ?')
      .get(bookingId) as unknown as { n: number };
    return row.n;
  }
}
