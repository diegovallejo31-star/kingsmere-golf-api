import { NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { MemberRepository } from '../members/member.repository';
import type { HandicapFilter, HandicapRepository } from './handicap.repository';
import type { Handicap, NewHandicap } from './handicap.types';

/**
 * Handicaps.
 *
 * The record is append-only in spirit: a new handicap is a new row, and the one
 * in play is whichever is latest by the day it took effect. Reading a member's
 * current handicap is therefore a query, not a stored field that has to be kept
 * in step by hand.
 */
export class HandicapService {
  constructor(
    private readonly repo: HandicapRepository,
    private readonly members: MemberRepository,
  ) {}

  create(memberId: number, input: Omit<NewHandicap, 'memberId'>): Handicap {
    if (!this.members.findById(memberId)) {
      throw new NotFoundError('member', memberId);
    }
    return this.repo.create({ ...input, memberId });
  }

  list(memberId: number, filter: HandicapFilter, limit?: number, offset?: number): Handicap[] {
    if (!this.members.findById(memberId)) {
      throw new NotFoundError('member', memberId);
    }
    return this.repo.list(memberId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Handicap {
    const handicap = this.repo.findById(id);
    if (!handicap) throw new NotFoundError('handicap', id);
    return handicap;
  }

  current(memberId: number): Handicap {
    if (!this.members.findById(memberId)) {
      throw new NotFoundError('member', memberId);
    }
    const handicap = this.repo.currentForMember(memberId);
    if (!handicap) throw new NotFoundError('handicap for member', memberId);
    return handicap;
  }
}
