import type { Request, Response } from 'express';
import type { CompetitionService } from './competition.service';

export class CompetitionController {
  constructor(private readonly service: CompetitionService) {}

  create = (req: Request, res: Response): void => {
    res.status(201).json(this.service.create(Number(req.params.clubId), req.body));
  };

  list = (req: Request, res: Response): void => {
    const { name, format, limit, offset } = req.query as unknown as {
      name?: string;
      format?: 'medal' | 'stableford' | 'matchplay';
      limit?: number;
      offset?: number;
    };
    res.json({
      items: this.service.list(Number(req.params.clubId), { name, format }, limit, offset),
    });
  };

  getById = (req: Request, res: Response): void => {
    res.json(this.service.getById(Number(req.params.id)));
  };

  update = (req: Request, res: Response): void => {
    res.json(this.service.update(Number(req.params.id), req.body));
  };
}
