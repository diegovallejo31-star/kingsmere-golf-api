import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { MemberRepository } from '../members/member.repository';
import { StaffMemberRepository } from '../staff/staffMember.repository';
import type { LessonFilter, LessonRepository } from './lesson.repository';
import type { Lesson, LessonDraft } from './lesson.types';

/**
 * Lessons.
 *
 * The charge is the hourly rate scaled to the minutes actually taught, rounded
 * to the penny once. The pro has to be professional staff - the bar steward
 * cannot be booked for a lesson - and the charge is stored so a later change to
 * the rate does not reprice a lesson already given.
 */
export class LessonService {
  constructor(
    private readonly repo: LessonRepository,
    private readonly members: MemberRepository,
    private readonly staff: StaffMemberRepository,
  ) {}

  create(memberId: number, input: LessonDraft): Lesson {
    if (!this.members.findById(memberId)) {
      throw new NotFoundError('member', memberId);
    }
    const pro = this.staff.findById(input.proId);
    if (!pro) throw new NotFoundError('staff member', input.proId);
    if (pro.role !== 'professional') {
      throw new ConflictError(`staff member ${input.proId} is ${pro.role}, not a professional`);
    }

    const chargePence = Math.round((input.ratePence * input.minutes) / 60);
    return this.repo.create({ ...input, memberId, chargePence });
  }

  list(memberId: number, filter: LessonFilter, limit?: number, offset?: number): Lesson[] {
    if (!this.members.findById(memberId)) {
      throw new NotFoundError('member', memberId);
    }
    return this.repo.list(memberId, pageFrom(limit, offset), filter);
  }

  getById(id: number): Lesson {
    const lesson = this.repo.findById(id);
    if (!lesson) throw new NotFoundError('lesson', id);
    return lesson;
  }
}
