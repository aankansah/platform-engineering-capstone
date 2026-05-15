import request from 'supertest';

// Mock the kafka client publishTask so tests don't require Kafka
jest.mock('../src/lib/kafkaClient', () => ({
  publishTask: jest.fn(async () => Promise.resolve()),
}));

import { app } from '../src/index';
import { addEvent } from '../src/repositories/eventRepository';

describe('task-api endpoints', () => {
  it('creates a task and returns task with taskId', async () => {
    const payload = { name: 'Process Customer Data', priority: 'high', description: 'desc' };
    const res = await request(app).post('/api/tasks').send(payload).expect(201);
    expect(res.body).toHaveProperty('taskId');
    expect(res.body.name).toBe(payload.name);
  });

  it('returns consumed events', async () => {
    addEvent({ topic: 'events', partition: 0, offset: '1', value: { ok: true }, timestamp: Date.now() });
    const res = await request(app).get('/api/events').expect(200);
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.events.length).toBeGreaterThan(0);
  });
});
