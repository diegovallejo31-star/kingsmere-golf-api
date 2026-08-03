import type { Request, Response } from 'express';
import type { MemberService } from './member.service';

export class MemberController {
  constructor(private readonly service: MemberService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(req.body));
  };

  list = (req: Request, res: Response): void => {
    const { memberRef, limit, offset } = req.query as unknown as {
      memberRef?: string;
      limit?: number;
      offset?: number;
    };
    res.json({ items: this.service.list({ memberRef }, limit, offset) });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };

  update = (req: Request, res: Response): void => {
    res.json(this.service.update(Number(req.params.id), req.body));
  };
}
