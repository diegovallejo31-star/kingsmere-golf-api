import type { Request, Response } from 'express';
import type { BuggyHireService } from './buggyHire.service';

export class BuggyHireController {
  constructor(private readonly service: BuggyHireService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.bookingId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { buggyRef, limit, offset } = req.query as unknown as {
      buggyRef?: string;
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(Number(req.params.bookingId), { buggyRef }, limit, offset),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };
}
