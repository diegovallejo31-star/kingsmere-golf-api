import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Club, ClubRow, NewClub } from './club.types';

export function toClub(row: ClubRow): Club {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    town: row.town,
    holes: row.holes,
    foundedOn: row.founded_on,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface ClubFilter {
  code?: string;
}

export class ClubRepository {
  constructor(private readonly db: Database) {}

  create(input: NewClub): Club {
    const row = this.db
      .prepare(
        `INSERT INTO clubs (code, name, town, holes, founded_on)
         VALUES (?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.code,
        input.name,
        input.town,
        input.holes,
        input.foundedOn,
      ) as unknown as ClubRow;
    return toClub(row);
  }

  findById(id: number): Club | null {
    const row = this.db.prepare('SELECT * FROM clubs WHERE id = ?').get(id) as unknown as
      ClubRow | undefined;
    return row ? toClub(row) : null;
  }

  findByCode(code: string): Club | null {
    const row = this.db.prepare('SELECT * FROM clubs WHERE code = ?').get(code) as unknown as
      ClubRow | undefined;
    return row ? toClub(row) : null;
  }

  list(page: Page, filter: ClubFilter = {}): Club[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    if (filter.code !== undefined) {
      clauses.push('code = ?');
      args.push(filter.code);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM clubs ${where} ORDER BY code ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as ClubRow[];
    return rows.map(toClub);
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS n FROM clubs').get() as unknown as {
      n: number;
    };
    return row.n;
  }
}
