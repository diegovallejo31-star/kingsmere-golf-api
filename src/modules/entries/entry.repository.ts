import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Entry, EntryRow, EntryStatus, NewEntry } from './entry.types';

export function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    competitionId: row.competition_id,
    memberId: row.member_id,
    feePence: row.fee_pence,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface EntryFilter {
  status?: EntryStatus;
  memberId?: number;
}

export class EntryRepository {
  constructor(private readonly db: Database) {}

  create(input: NewEntry): Entry {
    const row = this.db
      .prepare(
        `INSERT INTO entries (competition_id, member_id, fee_pence)
         VALUES (?, ?, ?) RETURNING *`,
      )
      .get(input.competitionId, input.memberId, input.feePence) as unknown as EntryRow;
    return toEntry(row);
  }

  findById(id: number): Entry | null {
    const row = this.db.prepare('SELECT * FROM entries WHERE id = ?').get(id) as unknown as
      EntryRow | undefined;
    return row ? toEntry(row) : null;
  }

  list(competitionId: number, page: Page, filter: EntryFilter = {}): Entry[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('competition_id = ?');
    args.push(competitionId);
    if (filter.status) {
      clauses.push('status = ?');
      args.push(filter.status);
    }
    if (filter.memberId !== undefined) {
      clauses.push('member_id = ?');
      args.push(filter.memberId);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM entries ${where} ORDER BY id ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as EntryRow[];
    return rows.map(toEntry);
  }

  setStatus(id: number, next: EntryStatus): Entry | null {
    const row = this.db
      .prepare(`UPDATE entries SET status = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(next, id) as unknown as EntryRow | undefined;
    return row ? toEntry(row) : null;
  }

  count(competitionId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM entries WHERE competition_id = ?')
      .get(competitionId) as unknown as { n: number };
    return row.n;
  }

  /** The entry a member already has in a competition, if any. */
  findByCompetitionIdAndMemberId(competitionId: number, memberId: number): Entry | null {
    const row = this.db
      .prepare('SELECT * FROM entries WHERE competition_id = ? AND member_id = ?')
      .get(competitionId, memberId) as unknown as EntryRow | undefined;
    return row ? toEntry(row) : null;
  }

  /** Every standing entry a member has, across all competitions. */
  enteredForMember(memberId: number): Entry[] {
    const rows = this.db
      .prepare(
        "SELECT * FROM entries WHERE member_id = ? AND status = 'entered' ORDER BY id ASC",
      )
      .all(memberId) as unknown as EntryRow[];
    return rows.map(toEntry);
  }
}
