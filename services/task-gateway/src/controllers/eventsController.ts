import { Request, Response } from 'express';
import { getAllEvents } from '../repositories/eventRepository';

function listEvents(_req: Request, res: Response) {
  const events = getAllEvents();
  res.json({ events });
}

export { listEvents };
