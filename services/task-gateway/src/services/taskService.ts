import { v4 as uuidv4 } from 'uuid';
import { publishTask } from '../lib/kafkaClient';
import { addEvent } from '../repositories/eventRepository';
import { TOPICS } from '../config';

type TaskPayload = Record<string, any>;

async function createTask(payload: TaskPayload) {
  const taskId = uuidv4();
  const createdAt = new Date().toISOString();
  const task: TaskPayload = { ...payload, taskId, createdAt };
  await publishTask(task);

  addEvent({
    topic: TOPICS.TASK_EVENTS,
    partition: 0,
    offset: `local-${taskId}`,
    taskId,
    service: 'task-gateway',
    status: 'PUBLISHED',
    message: 'Task Gateway published task to Kafka topic tasks',
    timestamp: createdAt,
    priority: task.priority,
    title: task.name,
    name: task.name,
    description: task.description,
  });

  return task;
}

export { createTask };
