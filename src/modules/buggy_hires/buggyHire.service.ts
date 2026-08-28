import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { BookingRepository } from '../bookings/booking.repository';
import type { BuggyHireFilter, BuggyHireRepository } from './buggyHire.repository';
import type { BuggyHire, NewBuggyHire } from './buggyHire.types';

/**
 * Buggy hires.
 *
 * A buggy can only be put on a booking that is still booked - once the round has
 * been played or the slot cancelled, the sheet is closed and a buggy added after
 * the fact has no round to be on.
 */
export class BuggyHireService {
  constructor(
    private readonly repo: BuggyHireRepository,
    private readonly bookings: BookingRepository,
  ) {}

  create(bookingId: number, input: Omit<NewBuggyHire, 'bookingId'>): BuggyHire {
    const booking = this.bookings.findById(bookingId);
    if (!booking) throw new NotFoundError('booking', bookingId);
    if (booking.status !== 'booked') {
      throw new ConflictError(
        `booking ${bookingId} is ${booking.status}; no buggy can be added`,
      );
    }
    return this.repo.create({ ...input, bookingId });
  }

  list(
    bookingId: number,
    filter: BuggyHireFilter,
    limit?: number,
    offset?: number,
  ): BuggyHire[] {
    if (!this.bookings.findById(bookingId)) {
      throw new NotFoundError('booking', bookingId);
    }
    return this.repo.list(bookingId, pageFrom(limit, offset), filter);
  }

  getById(id: number): BuggyHire {
    const hire = this.repo.findById(id);
    if (!hire) throw new NotFoundError('buggy hire', id);
    return hire;
  }
}
