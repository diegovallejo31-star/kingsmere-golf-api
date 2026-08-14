import type { Request, Response } from 'express';
import type { LockerService } from './locker.service';
import type { LockerStatus } from './locker.types';

export class LockerController {
  constructor(private readonly service: LockerService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.clubId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { status, lockerNumber, limit, offset } = req.query as unknown as {
      status?: LockerStatus;
      lockerNumber?: string;
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(
        Number(req.params.clubId),
        { status, lockerNumber },
        limit,
        offset,
      ),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };

  update = (req: Request, res: Response): void => {
    res.json(this.service.update(Number(req.params.id), req.body));
  };
}
