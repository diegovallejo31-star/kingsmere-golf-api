import type { Request, Response } from 'express';
import type { LessonService } from './lesson.service';

export class LessonController {
  constructor(private readonly service: LessonService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.memberId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { proId, limit, offset } = req.query as unknown as {
      proId?: number;
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(Number(req.params.memberId), { proId }, limit, offset),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };
}
