import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import type { ClubFilter, ClubRepository } from './club.repository';
import type { Club, NewClub } from './club.types';

/**
 * Clubs.
 *
 * The code is the club's own and unique across the group; two clubs sharing one
 * would put a visitor's green fee on the wrong course's books.
 */
export class ClubService {
  constructor(private readonly repo: ClubRepository) {}

  create(input: NewClub): Club {
    if (this.repo.findByCode(input.code)) {
      throw new ConflictError(`club ${input.code} already exists`);
    }
    return this.repo.create(input);
  }

  list(filter: ClubFilter, limit?: number, offset?: number): Club[] {
    return this.repo.list(pageFrom(limit, offset), filter);
  }

  getById(id: number): Club {
    const club = this.repo.findById(id);
    if (!club) throw new NotFoundError('club', id);
    return club;
  }
}
