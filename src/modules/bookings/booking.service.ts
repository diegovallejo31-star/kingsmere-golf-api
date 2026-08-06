import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { MemberRepository } from '../members/member.repository';
import type { BookingFilter, BookingRepository } from './booking.repository';
import type { Booking, BookingStatus, NewBooking } from './booking.types';

/**
 * Bookings.
 *
 * A booking leaves the booked state exactly once, to played or cancelled, and
 * stays there. Marking a round played is what a guest's green fee is finally
 * billed against, and a cancelled slot is one the sheet has already given away.
 */
export class BookingService {
  constructor(
    private readonly repo: BookingRepository,
    private readonly members: MemberRepository,
  ) {}

  create(memberId: number, input: Omit<NewBooking, 'memberId'>): Booking {
    if (!this.members.findById(memberId)) {
      throw new NotFoundError('member', memberId);
    }
    return this.repo.create({ ...input, memberId });
  }

  list(memberId: number, filter: BookingFilter, limit?: number, offset?: number): Booking[] {
    if (!this.members.findById(memberId)) {
      throw new NotFoundError('member', memberId);
    }
    return this.repo.list(memberId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Booking {
    const booking = this.repo.findById(id);
    if (!booking) throw new NotFoundError('booking', id);
    return booking;
  }

  changeStatus(id: number, next: Exclude<BookingStatus, 'booked'>): Booking {
    const booking = this.getById(id);
    if (booking.status !== 'booked') {
      throw new ConflictError(`booking ${id} is already ${booking.status}`);
    }
    const moved = this.repo.setStatus(id, next);
    if (!moved) throw new NotFoundError('booking', id);
    return moved;
  }
}
