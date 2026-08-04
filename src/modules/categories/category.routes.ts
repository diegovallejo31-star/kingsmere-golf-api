import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { CategoryController } from './category.controller';
import { CategoryRepository } from './category.repository';
import {
  categoryIdParamSchema,
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from './category.schema';
import { CategoryService } from './category.service';

function controllerFor(db: Database): CategoryController {
  return new CategoryController(new CategoryService(new CategoryRepository(db)));
}

export function createCategoryRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post('/', validateRequest({ body: createCategorySchema }), controller.create);
  router.get('/', validateRequest({ query: categoryQuerySchema }), controller.list);
  router.get('/:id', validateRequest({ params: categoryIdParamSchema }), controller.getById);
  router.patch(
    '/:id',
    validateRequest({ params: categoryIdParamSchema, body: updateCategorySchema }),
    controller.update,
  );

  return router;
}
