import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type {
  Competition,
  CompetitionPatch,
  CompetitionRow,
  NewCompetition,
} from './competition.types';

export function toCompetition(row: CompetitionRow): Competition {
  return {
    id: row.id,
    clubId: row.club_id,
    name: row.name,
    onDay: row.on_day,
    format: row.format,
    entryFeePence: row.entry_fee_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface CompetitionFilter {
  name?: string;
  format?: 'medal' | 'stableford' | 'matchplay';
}

export class CompetitionRepository {
  constructor(private readonly db: Database) {}

  create(input: NewCompetition): Competition {
    const row = this.db
      .prepare(
        `INSERT INTO competitions (club_id, name, on_day, format, entry_fee_pence)
         VALUES (?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.clubId,
        input.name,
        input.onDay,
        input.format,
        input.entryFeePence,
      ) as unknown as CompetitionRow;
    return toCompetition(row);
  }

  findById(id: number): Competition | null {
    const row = this.db
      .prepare('SELECT * FROM competitions WHERE id = ?')
      .get(id) as unknown as CompetitionRow | undefined;
    return row ? toCompetition(row) : null;
  }

  list(clubId: number, page: Page, filter: CompetitionFilter = {}): Competition[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('club_id = ?');
    args.push(clubId);
    if (filter.name !== undefined) {
      clauses.push('name = ?');
      args.push(filter.name);
    }
    if (filter.format !== undefined) {
      clauses.push('format = ?');
      args.push(filter.format);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM competitions ${where} ORDER BY on_day DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as CompetitionRow[];
    return rows.map(toCompetition);
  }

  update(id: number, patch: CompetitionPatch): Competition | null {
    const current = this.findById(id);
    if (!current) return null;

    const row = this.db
      .prepare(
        `UPDATE competitions SET entry_fee_pence = ?, ${TOUCHED} WHERE id = ? RETURNING *`,
      )
      .get(patch.entryFeePence ?? current.entryFeePence, id) as unknown as CompetitionRow;
    return toCompetition(row);
  }

  count(clubId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM competitions WHERE club_id = ?')
      .get(clubId) as unknown as { n: number };
    return row.n;
  }
}
