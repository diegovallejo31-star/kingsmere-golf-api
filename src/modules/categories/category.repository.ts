import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Category, CategoryPatch, CategoryRow, NewCategory } from './category.types';

export function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    annualRatePence: row.annual_rate_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface CategoryFilter {
  code?: string;
}

export class CategoryRepository {
  constructor(private readonly db: Database) {}

  create(input: NewCategory): Category {
    const row = this.db
      .prepare(
        `INSERT INTO categories (code, name, annual_rate_pence)
         VALUES (?, ?, ?) RETURNING *`,
      )
      .get(input.code, input.name, input.annualRatePence) as unknown as CategoryRow;
    return toCategory(row);
  }

  findById(id: number): Category | null {
    const row = this.db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as unknown as
      CategoryRow | undefined;
    return row ? toCategory(row) : null;
  }

  findByCode(code: string): Category | null {
    const row = this.db
      .prepare('SELECT * FROM categories WHERE code = ?')
      .get(code) as unknown as CategoryRow | undefined;
    return row ? toCategory(row) : null;
  }

  list(page: Page, filter: CategoryFilter = {}): Category[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    if (filter.code !== undefined) {
      clauses.push('code = ?');
      args.push(filter.code);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM categories ${where} ORDER BY code ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as CategoryRow[];
    return rows.map(toCategory);
  }

  update(id: number, patch: CategoryPatch): Category | null {
    const current = this.findById(id);
    if (!current) return null;

    const row = this.db
      .prepare(
        `UPDATE categories SET annual_rate_pence = ?, ${TOUCHED} WHERE id = ? RETURNING *`,
      )
      .get(patch.annualRatePence ?? current.annualRatePence, id) as unknown as CategoryRow;
    return toCategory(row);
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS n FROM categories').get() as unknown as {
      n: number;
    };
    return row.n;
  }
}
