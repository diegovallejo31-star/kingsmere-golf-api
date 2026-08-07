import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { BookingRepository } from '../bookings/booking.repository';
import type { GuestFilter, GuestRepository } from './guest.repository';
import type { Guest, NewGuest } from './guest.types';

/**
 * Guests.
 *
 * A guest can only be signed in against a booking that has not been played or
 * cancelled yet - once the round is over or called off, the sheet is closed and
 * a guest added afterwards has no round to be on.
 */
export class GuestService {
  constructor(
    private readonly repo: GuestRepository,
    private readonly bookings: BookingRepository,
  ) {}

  create(bookingId: number, input: Omit<NewGuest, 'bookingId'>): Guest {
    const booking = this.bookings.findById(bookingId);
    if (!booking) throw new NotFoundError('booking', bookingId);
    if (booking.status !== 'booked') {
      throw new ConflictError(
        `booking ${bookingId} is ${booking.status}; no guest can be added`,
      );
    }
    return this.repo.create({ ...input, bookingId });
  }

  list(bookingId: number, filter: GuestFilter, limit?: number, offset?: number): Guest[] {
    if (!this.bookings.findById(bookingId)) {
      throw new NotFoundError('booking', bookingId);
    }
    return this.repo.list(bookingId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Guest {
    const guest = this.repo.findById(id);
    if (!guest) throw new NotFoundError('guest', id);
    return guest;
  }
}
