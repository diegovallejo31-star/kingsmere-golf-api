import type { Request, Response } from 'express';
import type { RentalService } from './rental.service';
import type { RentalStatus } from './rental.types';

export class RentalController {
  constructor(private readonly service: RentalService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.memberId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { status, lockerId, limit, offset } = req.query as unknown as {
      status?: RentalStatus;
      lockerId?: number;
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(
        Number(req.params.memberId),
        { status, lockerId },
        limit,
        offset,
      ),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };

  end = (req: Request, res: Response): void => {
    res.json(this.service.end(Number(req.params.id)));
  };
}
