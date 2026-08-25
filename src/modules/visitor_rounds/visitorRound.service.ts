import { NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { ClubRepository } from '../clubs/club.repository';
import type { VisitorRoundFilter, VisitorRoundRepository } from './visitorRound.repository';
import type { NewVisitorRound, VisitorRound } from './visitorRound.types';

/**
 * Visitor rounds.
 *
 * A visitor round is a green fee and nothing more - there is no account behind
 * it, which is exactly why it hangs off the club and not a member. The fee is
 * what was taken at the till and is recorded as given.
 */
export class VisitorRoundService {
  constructor(
    private readonly repo: VisitorRoundRepository,
    private readonly clubs: ClubRepository,
  ) {}

  create(clubId: number, input: Omit<NewVisitorRound, 'clubId'>): VisitorRound {
    if (!this.clubs.findById(clubId)) {
      throw new NotFoundError('club', clubId);
    }
    return this.repo.create({ ...input, clubId });
  }

  list(
    clubId: number,
    filter: VisitorRoundFilter,
    limit?: number,
    offset?: number,
  ): VisitorRound[] {
    if (!this.clubs.findById(clubId)) {
      throw new NotFoundError('club', clubId);
    }
    return this.repo.list(clubId, pageFrom(limit, offset), filter);
  }

  getById(id: number): VisitorRound {
    const round = this.repo.findById(id);
    if (!round) throw new NotFoundError('visitor round', id);
    return round;
  }
}
