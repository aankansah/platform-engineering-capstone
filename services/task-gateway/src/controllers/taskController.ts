import { Request, Response } from 'express';
import { createTask as createTaskService } from '../services/taskService';
import { validateTask } from '../utils/validateTask';

async function createTask(req: Request, res: Response) {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') return res.status(400).json({ error: 'missing body' });

  const check = validateTask(payload as Record<string, any>);
  if (!check.valid) return res.status(400).json({ error: check.reason });

  try {
    const task = await createTaskService(payload as Record<string, any>);
    return res.status(201).json(task);
  } catch (err) {
    console.error('createTask error', err);
    return res.status(500).json({ error: 'failed to create task' });
  }
}

export { createTask };
