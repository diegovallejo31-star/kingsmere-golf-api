import { ConflictError, NotFoundError } from '../../lib/AppError';
import { pageFrom } from '../../lib/pagination';
import type { CategoryFilter, CategoryRepository } from './category.repository';
import type { Category, CategoryPatch, NewCategory } from './category.types';

/**
 * Categories.
 *
 * The rate card. A subscription reads the annual rate off here at the moment it
 * is raised and then holds its own worked-out figure, so a rate rise next season
 * does not reprice a subscription already billed.
 */
export class CategoryService {
  constructor(private readonly repo: CategoryRepository) {}

  create(input: NewCategory): Category {
    if (this.repo.findByCode(input.code)) {
      throw new ConflictError(`category ${input.code} already exists`);
    }
    return this.repo.create(input);
  }

  list(filter: CategoryFilter, limit?: number, offset?: number): Category[] {
    return this.repo.list(pageFrom(limit, offset), filter);
  }

  getById(id: number): Category {
    const category = this.repo.findById(id);
    if (!category) throw new NotFoundError('category', id);
    return category;
  }

  update(id: number, patch: CategoryPatch): Category {
    this.getById(id);
    const updated = this.repo.update(id, patch);
    if (!updated) throw new NotFoundError('category', id);
    return updated;
  }
}
