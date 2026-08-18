import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Lesson, LessonRow, NewLesson } from './lesson.types';

export function toLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    memberId: row.member_id,
    proId: row.pro_id,
    onDay: row.on_day,
    minutes: row.minutes,
    ratePence: row.rate_pence,
    chargePence: row.charge_pence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface LessonFilter {
  proId?: number;
}

export class LessonRepository {
  constructor(private readonly db: Database) {}

  create(input: NewLesson): Lesson {
    const row = this.db
      .prepare(
        `INSERT INTO lessons (member_id, pro_id, on_day, minutes, rate_pence, charge_pence)
         VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.memberId,
        input.proId,
        input.onDay,
        input.minutes,
        input.ratePence,
        input.chargePence,
      ) as unknown as LessonRow;
    return toLesson(row);
  }

  findById(id: number): Lesson | null {
    const row = this.db.prepare('SELECT * FROM lessons WHERE id = ?').get(id) as unknown as
      LessonRow | undefined;
    return row ? toLesson(row) : null;
  }

  list(memberId: number, page: Page, filter: LessonFilter = {}): Lesson[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('member_id = ?');
    args.push(memberId);
    if (filter.proId !== undefined) {
      clauses.push('pro_id = ?');
      args.push(filter.proId);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM lessons ${where} ORDER BY on_day DESC, id DESC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as LessonRow[];
    return rows.map(toLesson);
  }

  count(memberId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM lessons WHERE member_id = ?')
      .get(memberId) as unknown as { n: number };
    return row.n;
  }
}
