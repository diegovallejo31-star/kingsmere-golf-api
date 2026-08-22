import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Handicap, HandicapRow, NewHandicap } from './handicap.types';

export function toHandicap(row: HandicapRow): Handicap {
  return {
    id: row.id,
    memberId: row.member_id,
    recordedOn: row.recorded_on,
    exactTenths: row.exact_tenths,
    reason: row.reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Nothing to narrow a list of these by yet. */
export type HandicapFilter = Record<string, never>;

export class HandicapRepository {
  constructor(private readonly db: Database) {}

  create(input: NewHandicap): Handicap {
    const row = this.db
      .prepare(
        `INSERT INTO handicaps (member_id, recorded_on, exact_tenths, reason)
         VALUES (?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.memberId,
        input.recordedOn,
        input.exactTenths,
        input.reason,
      ) as unknown as HandicapRow;
    return toHandicap(row);
  }

  findById(id: number): Handicap | null {
    const row = this.db.prepare('SELECT * FROM handicaps WHERE id = ?').get(id) as unknown as
      HandicapRow | undefined;
    return row ? toHandicap(row) : null;
  }

  list(memberId: number, page: Page, _filter: HandicapFilter = {}): Handicap[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('member_id = ?');
    args.push(memberId);
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM handicaps ${where} ORDER BY recorded_on DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as HandicapRow[];
    return rows.map(toHandicap);
  }

  count(memberId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM handicaps WHERE member_id = ?')
      .get(memberId) as unknown as { n: number };
    return row.n;
  }

  /** The handicap a member plays off now: the most recent by date. */
  currentForMember(memberId: number): Handicap | null {
    const row = this.db
      .prepare(
        'SELECT * FROM handicaps WHERE member_id = ? ORDER BY recorded_on DESC, id DESC LIMIT 1',
      )
      .get(memberId) as unknown as HandicapRow | undefined;
    return row ? toHandicap(row) : null;
  }
}
