import { NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { ClubRepository } from '../clubs/club.repository';
import type { CompetitionFilter, CompetitionRepository } from './competition.repository';
import type { Competition, CompetitionPatch, NewCompetition } from './competition.types';

/**
 * Competitions.
 *
 * The entry fee lives here and is read by an entry at the moment it is made.
 * The fee is patchable - the office can correct it before entries open - but a
 * correction does not reach entries already taken, because each of those kept
 * the fee it was charged.
 */
export class CompetitionService {
  constructor(
    private readonly repo: CompetitionRepository,
    private readonly clubs: ClubRepository,
  ) {}

  create(clubId: number, input: Omit<NewCompetition, 'clubId'>): Competition {
    if (!this.clubs.findById(clubId)) {
      throw new NotFoundError('club', clubId);
    }
    return this.repo.create({ ...input, clubId });
  }

  list(
    clubId: number,
    filter: CompetitionFilter,
    limit?: number,
    offset?: number,
  ): Competition[] {
    if (!this.clubs.findById(clubId)) {
      throw new NotFoundError('club', clubId);
    }
    return this.repo.list(clubId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Competition {
    const competition = this.repo.findById(id);
    if (!competition) throw new NotFoundError('competition', id);
    return competition;
  }

  update(id: number, patch: CompetitionPatch): Competition {
    this.getById(id);
    const updated = this.repo.update(id, patch);
    if (!updated) throw new NotFoundError('competition', id);
    return updated;
  }
}
