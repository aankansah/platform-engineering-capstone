import { v4 as uuidv4 } from 'uuid';
import { publishTask } from '../lib/kafkaClient';

type TaskPayload = Record<string, any>;

async function createTask(payload: TaskPayload) {
  const taskId = uuidv4();
  const task = { taskId, ...payload, createdAt: new Date().toISOString() };
  await publishTask(task);
  return task;
}

export { createTask };
