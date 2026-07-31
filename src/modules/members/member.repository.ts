import type { Database } from '../../db/client';
import type { Page } from '../../lib/pagination';
import type { Member, MemberPatch, MemberRow, NewMember } from './member.types';

export function toMember(row: MemberRow): Member {
  return {
    id: row.id,
    memberRef: row.member_ref,
    name: row.name,
    email: row.email,
    joinedOn: row.joined_on,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TOUCHED = "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export interface MemberFilter {
  memberRef?: string;
}

export class MemberRepository {
  constructor(private readonly db: Database) {}

  create(input: NewMember): Member {
    const row = this.db
      .prepare(
        `INSERT INTO members (member_ref, name, email, joined_on)
         VALUES (?, ?, ?, ?) RETURNING *`,
      )
      .get(
        input.memberRef,
        input.name,
        input.email ?? null,
        input.joinedOn,
      ) as unknown as MemberRow;
    return toMember(row);
  }

  findById(id: number): Member | null {
    const row = this.db.prepare('SELECT * FROM members WHERE id = ?').get(id) as unknown as
      MemberRow | undefined;
    return row ? toMember(row) : null;
  }

  findByMemberRef(memberRef: string): Member | null {
    const row = this.db
      .prepare('SELECT * FROM members WHERE member_ref = ?')
      .get(memberRef) as unknown as MemberRow | undefined;
    return row ? toMember(row) : null;
  }

  list(page: Page, filter: MemberFilter = {}): Member[] {
    const clauses: string[] = [];
    const args: (string | number)[] = [];
    if (filter.memberRef !== undefined) {
      clauses.push('member_ref = ?');
      args.push(filter.memberRef);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const rows = this.db
      .prepare(`SELECT * FROM members ${where} ORDER BY member_ref ASC LIMIT ? OFFSET ?`)
      .all(...args, page.limit, page.offset) as unknown as MemberRow[];
    return rows.map(toMember);
  }

  update(id: number, patch: MemberPatch): Member | null {
    const current = this.findById(id);
    if (!current) return null;

    const row = this.db
      .prepare(`UPDATE members SET email = ?, ${TOUCHED} WHERE id = ? RETURNING *`)
      .get(patch.email ?? current.email ?? null, id) as unknown as MemberRow;
    return toMember(row);
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS n FROM members').get() as unknown as {
      n: number;
    };
    return row.n;
  }
}
