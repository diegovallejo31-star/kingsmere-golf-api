import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import { ClubRepository } from '../clubs/club.repository';
import type { StaffMemberFilter, StaffMemberRepository } from './staffMember.repository';
import type { NewStaffMember, StaffMember, StaffMemberPatch } from './staffMember.types';

/**
 * Staff.
 *
 * Payroll numbers are handed out per club and reused across the group, so the
 * uniqueness check is scoped to the club: KGM/12 and LNK/12 are two people.
 */
export class StaffMemberService {
  constructor(
    private readonly repo: StaffMemberRepository,
    private readonly clubs: ClubRepository,
  ) {}

  create(clubId: number, input: Omit<NewStaffMember, 'clubId'>): StaffMember {
    if (!this.clubs.findById(clubId)) {
      throw new NotFoundError('club', clubId);
    }
    if (this.repo.findByPayrollNumber(clubId, input.payrollNumber)) {
      throw new ConflictError(
        `payroll number ${input.payrollNumber} is already used at this club`,
      );
    }
    return this.repo.create({ ...input, clubId });
  }

  list(
    clubId: number,
    filter: StaffMemberFilter,
    limit?: number,
    offset?: number,
  ): StaffMember[] {
    if (!this.clubs.findById(clubId)) {
      throw new NotFoundError('club', clubId);
    }
    return this.repo.list(clubId, pageFrom(limit, offset), filter);
  }

  getById(id: number): StaffMember {
    const staff = this.repo.findById(id);
    if (!staff) throw new NotFoundError('staff member', id);
    return staff;
  }

  update(id: number, patch: StaffMemberPatch): StaffMember {
    this.getById(id);
    const updated = this.repo.update(id, patch);
    if (!updated) throw new NotFoundError('staff member', id);
    return updated;
  }
}
