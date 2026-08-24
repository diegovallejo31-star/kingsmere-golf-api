import type { Request, Response } from 'express';
import type { HandicapService } from './handicap.service';

export class HandicapController {
  constructor(private readonly service: HandicapService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.memberId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { limit, offset } = req.query as unknown as {
      limit?: number;
      offset?: number;
    };
    res.json({ items: this.service.list(Number(req.params.memberId), {}, limit, offset) });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };

  current = (req: Request, res: Response): void => {
    res.json(this.service.current(Number(req.params.memberId)));
  };
}
