import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { NewVisitorRound, VisitorRound, VisitorRoundRow } from './visitorRound.types';

export function toVisitorRound(row: VisitorRoundRow): VisitorRound {
  return {
    id: row.id,
    clubId: row.club_id,
    visitorName: row.visitor_name,
    onDay: row.on_day,
    holes: row.holes,
    feePence: row.fee_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Nothing to narrow a list of these by yet. */
export type VisitorRoundFilter = Record<string, never>;

export class VisitorRoundRepository {
  constructor(private readonly db: Database) {}

  create(input: NewVisitorRound): VisitorRound {
    const row = this.db
      .prepare(
        `INSERT INTO visitor_rounds (club_id, visitor_name, on_day, holes, fee_pence)
         VALUES (?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.clubId,
        input.visitorName,
        input.onDay,
        input.holes,
        input.feePence,
      ) as unknown as VisitorRoundRow;
    return toVisitorRound(row);
  }

  findById(id: number): VisitorRound | null {
    const row = this.db
      .prepare('SELECT * FROM visitor_rounds WHERE id = ?')
      .get(id) as unknown as VisitorRoundRow | undefined;
    return row ? toVisitorRound(row) : null;
  }

  list(clubId: number, page: Page, _filter: VisitorRoundFilter = {}): VisitorRound[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('club_id = ?');
    args.push(clubId);
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM visitor_rounds ${where} ORDER BY on_day DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as VisitorRoundRow[];
    return rows.map(toVisitorRound);
  }

  count(clubId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM visitor_rounds WHERE club_id = ?')
      .get(clubId) as unknown as { n: number };
    return row.n;
  }
}
