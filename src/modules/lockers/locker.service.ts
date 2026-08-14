import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { ClubRepository } from '../clubs/club.repository';
import type { LockerFilter, LockerRepository } from './locker.repository';
import type { Locker, LockerPatch, NewLocker } from './locker.types';

/**
 * Lockers.
 *
 * There is no route to move a locker between vacant and let - that is the
 * rental's job, because only the rental knows who has the key. What the club can
 * do here is add lockers and set their rent.
 */
export class LockerService {
  constructor(
    private readonly repo: LockerRepository,
    private readonly clubs: ClubRepository,
  ) {}

  create(clubId: number, input: Omit<NewLocker, 'clubId'>): Locker {
    if (!this.clubs.findById(clubId)) {
      throw new NotFoundError('club', clubId);
    }
    if (this.repo.findByLockerNumber(clubId, input.lockerNumber)) {
      throw new ConflictError(`locker ${input.lockerNumber} already exists at this club`);
    }
    return this.repo.create({ ...input, clubId });
  }

  list(clubId: number, filter: LockerFilter, limit?: number, offset?: number): Locker[] {
    if (!this.clubs.findById(clubId)) {
      throw new NotFoundError('club', clubId);
    }
    return this.repo.list(clubId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Locker {
    const locker = this.repo.findById(id);
    if (!locker) throw new NotFoundError('locker', id);
    return locker;
  }

  update(id: number, patch: LockerPatch): Locker {
    this.getById(id);
    const updated = this.repo.update(id, patch);
    if (!updated) throw new NotFoundError('locker', id);
    return updated;
  }
}
