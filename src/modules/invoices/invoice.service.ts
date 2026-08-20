import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { bpsOf } from '../../lib/money';
import { EntryRepository } from '../entries/entry.repository';
import { LessonRepository } from '../lessons/lesson.repository';
import { MemberRepository } from '../members/member.repository';
import { SubscriptionRepository } from '../subscriptions/subscription.repository';
import type { InvoiceFilter, InvoiceRepository } from './invoice.repository';
import type { Invoice, InvoiceDraft } from './invoice.types';

/** VAT at the standard rate, in basis points. */
const VAT_BASIS_POINTS = 2000;

/** No member has more of anything than this. */
const EVERYTHING = { limit: 1000, offset: 0 };

/**
 * Invoices.
 *
 * The three totals are read out of the subscriptions, lessons and entries once,
 * when the invoice is raised, and then stored. Only standing lines count - a
 * lapsed subscription or a withdrawn entry is not billed - and VAT is taken on
 * the net so the rounding lands once and the columns add back up.
 */
export class InvoiceService {
  constructor(
    private readonly repo: InvoiceRepository,
    private readonly members: MemberRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly lessons: LessonRepository,
    private readonly entries: EntryRepository,
  ) {}

  create(input: InvoiceDraft): Invoice {
    if (!this.members.findById(input.memberId)) {
      throw new NotFoundError('member', input.memberId);
    }
    if (this.repo.findByMemberId(input.memberId)) {
      throw new ConflictError(`member ${input.memberId} has already been invoiced`);
    }
    if (this.repo.findByNumber(input.number)) {
      throw new ConflictError(`invoice ${input.number} already exists`);
    }

    const subscriptionPence = this.subscriptions
      .list(input.memberId, EVERYTHING, { status: 'active' })
      .reduce((total, sub) => total + sub.amountPence, 0);
    const lessonsPence = this.lessons
      .list(input.memberId, EVERYTHING, {})
      .reduce((total, lesson) => total + lesson.chargePence, 0);
    const entriesPence = this.entries
      .enteredForMember(input.memberId)
      .reduce((total, entry) => total + entry.feePence, 0);

    const netPence = subscriptionPence + lessonsPence + entriesPence;
    const vatPence = bpsOf(netPence, VAT_BASIS_POINTS);

    return this.repo.create({
      ...input,
      subscriptionPence,
      lessonsPence,
      entriesPence,
      netPence,
      vatPence,
      grossPence: netPence + vatPence,
    });
  }

  list(filter: InvoiceFilter, limit?: number, offset?: number): Invoice[] {
    return this.repo.list(pageFrom(limit, offset), filter);
  }

  getById(id: number): Invoice {
    const invoice = this.repo.findById(id);
    if (!invoice) throw new NotFoundError('invoice', id);
    return invoice;
  }
}
