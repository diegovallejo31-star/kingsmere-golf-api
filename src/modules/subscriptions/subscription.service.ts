import { NotFoundError, ValidationError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { daysBetween } from '../../lib/clock';
import { CategoryRepository } from '../categories/category.repository';
import { MemberRepository } from '../members/member.repository';
import type { SubscriptionFilter, SubscriptionRepository } from './subscription.repository';
import type { Subscription, SubscriptionDraft } from './subscription.types';

/**
 * The apportioned subscription.
 *
 * The season is a half-open window, so its length is the days from the first day
 * up to but not including the day after the last. What a member pays is the
 * annual rate scaled by how much of that window is still ahead of them when
 * their cover starts - all of it if they start on day one, none of the days
 * already gone. The rate is read off the category once, here, and the answer is
 * stored, because that is the figure the member was billed.
 */
function apportion(
  annualRatePence: number,
  seasonStart: string,
  seasonEnd: string,
  startedOn: string,
): number {
  const seasonDays = daysBetween(seasonStart, seasonEnd);
  const coveredDays = daysBetween(startedOn, seasonEnd);
  return Math.round((annualRatePence * coveredDays) / seasonDays);
}

/**
 * Subscriptions.
 */
export class SubscriptionService {
  constructor(
    private readonly repo: SubscriptionRepository,
    private readonly members: MemberRepository,
    private readonly categories: CategoryRepository,
  ) {}

  create(memberId: number, input: SubscriptionDraft): Subscription {
    if (!this.members.findById(memberId)) {
      throw new NotFoundError('member', memberId);
    }
    const category = this.categories.findById(input.categoryId);
    if (!category) throw new NotFoundError('category', input.categoryId);

    if (input.seasonEnd <= input.seasonStart) {
      throw new ValidationError('a season has to end after it starts');
    }
    if (input.startedOn < input.seasonStart || input.startedOn >= input.seasonEnd) {
      throw new ValidationError('cover has to start within the season');
    }

    const amountPence = apportion(
      category.annualRatePence,
      input.seasonStart,
      input.seasonEnd,
      input.startedOn,
    );
    return this.repo.create({ ...input, memberId, amountPence });
  }

  list(
    memberId: number,
    filter: SubscriptionFilter,
    limit?: number,
    offset?: number,
  ): Subscription[] {
    if (!this.members.findById(memberId)) {
      throw new NotFoundError('member', memberId);
    }
    return this.repo.list(memberId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Subscription {
    const subscription = this.repo.findById(id);
    if (!subscription) throw new NotFoundError('subscription', id);
    return subscription;
  }
}
