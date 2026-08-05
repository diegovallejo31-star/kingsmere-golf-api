import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type {
  NewSubscription,
  Subscription,
  SubscriptionRow,
  SubscriptionStatus,
} from './subscription.types';

export function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    memberId: row.member_id,
    categoryId: row.category_id,
    seasonStart: row.season_start,
    seasonEnd: row.season_end,
    startedOn: row.started_on,
    amountPence: row.amount_pence,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface SubscriptionFilter {
  status?: SubscriptionStatus;
  categoryId?: number;
}

export class SubscriptionRepository {
  constructor(private readonly db: Database) {}

  create(input: NewSubscription): Subscription {
    const row = this.db
      .prepare(
        `INSERT INTO subscriptions (member_id, category_id, season_start, season_end, started_on, amount_pence)
         VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.memberId,
        input.categoryId,
        input.seasonStart,
        input.seasonEnd,
        input.startedOn,
        input.amountPence,
      ) as unknown as SubscriptionRow;
    return toSubscription(row);
  }

  findById(id: number): Subscription | null {
    const row = this.db
      .prepare('SELECT * FROM subscriptions WHERE id = ?')
      .get(id) as unknown as SubscriptionRow | undefined;
    return row ? toSubscription(row) : null;
  }

  list(memberId: number, page: Page, filter: SubscriptionFilter = {}): Subscription[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    clauses.push('member_id = ?');
    args.push(memberId);
    if (filter.status) {
      clauses.push('status = ?');
      args.push(filter.status);
    }
    if (filter.categoryId !== undefined) {
      clauses.push('category_id = ?');
      args.push(filter.categoryId);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(
        `SELECT * FROM subscriptions ${where} ORDER BY season_start DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...args, page.limit, page.offset) as unknown as SubscriptionRow[];
    return rows.map(toSubscription);
  }

  setStatus(id: number, next: SubscriptionStatus): Subscription | null {
    const row = this.db
      .prepare(`UPDATE subscriptions SET status = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(next, id) as unknown as SubscriptionRow | undefined;
    return row ? toSubscription(row) : null;
  }

  count(memberId: number): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM subscriptions WHERE member_id = ?')
      .get(memberId) as unknown as { n: number };
    return row.n;
  }
}
