import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { LockerRepository } from '../lockers/locker.repository';
import { MemberRepository } from '../members/member.repository';
import type { RentalFilter, RentalRepository } from './rental.repository';
import type { Rental, RentalDraft } from './rental.types';

/**
 * Rentals.
 *
 * Taking a rental checks the locker is vacant, copies its rent, and lets it -
 * all three or none, so a rental never exists against a locker somebody else
 * holds. Ending the rental frees the locker again. A locker that is already let
 * is refused rather than double-booked.
 */
export class RentalService {
  constructor(
    private readonly repo: RentalRepository,
    private readonly members: MemberRepository,
    private readonly lockers: LockerRepository,
  ) {}

  create(memberId: number, input: RentalDraft): Rental {
    if (!this.members.findById(memberId)) {
      throw new NotFoundError('member', memberId);
    }
    const locker = this.lockers.findById(input.lockerId);
    if (!locker) throw new NotFoundError('locker', input.lockerId);
    if (locker.status !== 'vacant') {
      throw new ConflictError(`locker ${locker.lockerNumber} is already let`);
    }

    const rental = this.repo.create({
      ...input,
      memberId,
      rentPence: locker.annualRentPence,
    });
    this.lockers.setStatus(input.lockerId, 'let');
    return rental;
  }

  list(memberId: number, filter: RentalFilter, limit?: number, offset?: number): Rental[] {
    if (!this.members.findById(memberId)) {
      throw new NotFoundError('member', memberId);
    }
    return this.repo.list(memberId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Rental {
    const rental = this.repo.findById(id);
    if (!rental) throw new NotFoundError('rental', id);
    return rental;
  }

  end(id: number): Rental {
    const rental = this.getById(id);
    if (rental.status !== 'active') {
      throw new ConflictError(`rental ${id} is already ended`);
    }
    const moved = this.repo.setStatus(id, 'ended');
    if (!moved) throw new NotFoundError('rental', id);
    this.lockers.setStatus(rental.lockerId, 'vacant');
    return moved;
  }
}
