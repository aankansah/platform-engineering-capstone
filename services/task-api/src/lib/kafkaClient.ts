import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import { addEvent } from '../repositories/eventRepository';

dotenv.config();

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const clientId = process.env.KAFKA_CLIENT_ID || 'task-api';
const groupId = process.env.KAFKA_GROUP_ID || 'task-api-group';

const kafka = new Kafka({ clientId, brokers });

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId });

async function startKafkaConsumer(): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({ topic: 'events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const value = message.value ? message.value.toString() : null;
        let parsed: any = value;
        try { parsed = JSON.parse(value as string); } catch (e) {}
        addEvent({ topic, partition, offset: message.offset, value: parsed, timestamp: Date.now() });
      } catch (err) {
        console.error('Error handling message', err);
      }
    }
  });
}

async function startKafkaProducer(): Promise<void> {
  await producer.connect();
}

async function publishTask(task: unknown) {
  const value = typeof task === 'string' ? task : JSON.stringify(task);
  return producer.send({ topic: 'tasks', messages: [{ value }] });
}

async function shutdown() {
  try { await producer.disconnect(); } catch (e) {}
  try { await consumer.disconnect(); } catch (e) {}
}

export { startKafkaConsumer, startKafkaProducer, publishTask, shutdown };
