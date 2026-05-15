import request from 'supertest';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-task-id'),
}));

// Mock the kafka client publishTask so tests don't require Kafka
jest.mock('../src/lib/kafkaClient', () => ({
  publishTask: jest.fn(async () => Promise.resolve()),
  startKafkaProducer: jest.fn(async () => Promise.resolve()),
  startKafkaConsumer: jest.fn(async () => Promise.resolve()),
  shutdown: jest.fn(async () => Promise.resolve()),
}));

import { app } from '../src/index';
import { addEvent } from '../src/repositories/eventRepository';

describe('task-gateway endpoints', () => {
  it('creates a task and returns task with taskId', async () => {
    const payload = { name: 'Process Customer Data', priority: 'high', description: 'desc' };
    const res = await request(app).post('/api/tasks').send(payload).expect(201);
    expect(res.body).toHaveProperty('taskId');
    expect(res.body.name).toBe(payload.name);
  });

  it('returns consumed events', async () => {
    addEvent({ topic: 'task-events', partition: 0, offset: '1', service: 'task-validator', message: 'ok', timestamp: new Date().toISOString() });
    const res = await request(app).get('/api/events').expect(200);
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.events.length).toBeGreaterThan(0);
  });
});
