import type { Request, Response } from 'express';
import type { GuestService } from './guest.service';

export class GuestController {
  constructor(private readonly service: GuestService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.bookingId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { limit, offset } = req.query as unknown as {
      limit?: number;
      offset?: number;
    };
    res.json({ items: this.service.list(Number(req.params.bookingId), {}, limit, offset) });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };
}
