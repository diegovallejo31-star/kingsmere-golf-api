import type { Request, Response } from 'express';
import type { SubscriptionService } from './subscription.service';
import type { SubscriptionStatus } from './subscription.types';

export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.memberId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { status, categoryId, limit, offset } = req.query as unknown as {
      status?: SubscriptionStatus;
      categoryId?: number;
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(
        Number(req.params.memberId),
        { status, categoryId },
        limit,
        offset,
      ),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };
}
