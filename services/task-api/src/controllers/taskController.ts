import { Request, Response } from 'express';
import { publishTask } from '../kafkaClient';
import { v4 as uuidv4 } from 'uuid';

async function createTask(req: Request, res: Response) {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') return res.status(400).json({ error: 'missing body' });

  const taskId = uuidv4();
  const task = { taskId, ...payload, createdAt: new Date().toISOString() };

  try {
    await publishTask(task);
    return res.status(201).json(task);
  } catch (err) {
    console.error('publish error', err);
    return res.status(500).json({ error: 'failed to publish' });
  }
}

export { createTask };
