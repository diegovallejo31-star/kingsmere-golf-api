import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import type { MemberFilter, MemberRepository } from './member.repository';
import type { Member, MemberPatch, NewMember } from './member.types';

/**
 * Members.
 *
 * The reference is the club's own and unique across the group; we only refuse to
 * hold the same one twice.
 */
export class MemberService {
  constructor(private readonly repo: MemberRepository) {}

  create(input: NewMember): Member {
    if (this.repo.findByMemberRef(input.memberRef)) {
      throw new ConflictError(`member ${input.memberRef} already exists`);
    }
    return this.repo.create(input);
  }

  list(filter: MemberFilter, limit?: number, offset?: number): Member[] {
    return this.repo.list(pageFrom(limit, offset), filter);
  }

  getById(id: number): Member {
    const member = this.repo.findById(id);
    if (!member) throw new NotFoundError('member', id);
    return member;
  }

  update(id: number, patch: MemberPatch): Member {
    this.getById(id);
    const updated = this.repo.update(id, patch);
    if (!updated) throw new NotFoundError('member', id);
    return updated;
  }
}
