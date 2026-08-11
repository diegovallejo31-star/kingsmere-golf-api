import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { CompetitionRepository } from '../competitions/competition.repository';
import { MemberRepository } from '../members/member.repository';
import type { EntryFilter, EntryRepository } from './entry.repository';
import type { Entry, EntryDraft } from './entry.types';

/**
 * Entries.
 *
 * Taking an entry copies the fee off the competition and holds it. A member can
 * only be in a competition once - a second entry is a mistake, not a second go -
 * and withdrawing is a one-way move that leaves the held fee alone, because what
 * to refund is worked out from what was charged.
 */
export class EntryService {
  constructor(
    private readonly repo: EntryRepository,
    private readonly competitions: CompetitionRepository,
    private readonly members: MemberRepository,
  ) {}

  create(competitionId: number, input: EntryDraft): Entry {
    const competition = this.competitions.findById(competitionId);
    if (!competition) throw new NotFoundError('competition', competitionId);
    if (!this.members.findById(input.memberId)) {
      throw new NotFoundError('member', input.memberId);
    }
    if (this.repo.findByCompetitionIdAndMemberId(competitionId, input.memberId)) {
      throw new ConflictError(
        `member ${input.memberId} is already entered in this competition`,
      );
    }
    return this.repo.create({ ...input, competitionId, feePence: competition.entryFeePence });
  }

  list(competitionId: number, filter: EntryFilter, limit?: number, offset?: number): Entry[] {
    if (!this.competitions.findById(competitionId)) {
      throw new NotFoundError('competition', competitionId);
    }
    return this.repo.list(competitionId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Entry {
    const entry = this.repo.findById(id);
    if (!entry) throw new NotFoundError('entry', id);
    return entry;
  }

  withdraw(id: number): Entry {
    const entry = this.getById(id);
    if (entry.status !== 'entered') {
      throw new ConflictError(`entry ${id} is already withdrawn`);
    }
    const moved = this.repo.setStatus(id, 'withdrawn');
    if (!moved) throw new NotFoundError('entry', id);
    return moved;
  }
}
