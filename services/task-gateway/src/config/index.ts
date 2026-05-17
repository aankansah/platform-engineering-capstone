import dotenv from 'dotenv';
import path from 'path';

// Load shared compose defaults first, then let the service-local file win for local dev.
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

export const PORT = Number(process.env.PORT) || 8080;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
export const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'task-gateway';
export const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'task-gateway-group';

export const TOPICS = {
  TASKS: process.env.TOPIC_TASKS || 'tasks',
  EVENTS: process.env.TOPIC_EVENTS || 'task-events',
  TASK_EVENTS: process.env.TOPIC_TASK_EVENTS || 'task-events',
};

export default {
  PORT,
  NODE_ENV,
  KAFKA_BROKERS,
  KAFKA_CLIENT_ID,
  KAFKA_GROUP_ID,
  TOPICS,
};
