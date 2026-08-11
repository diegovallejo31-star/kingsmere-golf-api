import type { Request, Response } from 'express';
import type { EntryService } from './entry.service';
import type { EntryStatus } from './entry.types';

export class EntryController {
  constructor(private readonly service: EntryService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.competitionId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { status, memberId, limit, offset } = req.query as unknown as {
      status?: EntryStatus;
      memberId?: number;
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(
        Number(req.params.competitionId),
        { status, memberId },
        limit,
        offset,
      ),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };

  withdraw = (req: Request, res: Response): void => {
    res.json(this.service.withdraw(Number(req.params.id)));
  };
}
