import { Kafka, Partitioners } from 'kafkajs';
import { addEvent } from '../repositories/eventRepository';
import { KAFKA_BROKERS, KAFKA_CLIENT_ID, KAFKA_GROUP_ID, TOPICS } from '../config';

const brokers = KAFKA_BROKERS;
const clientId = KAFKA_CLIENT_ID;
const groupId = KAFKA_GROUP_ID;

const kafka = new Kafka({ clientId, brokers });

const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
const consumer = kafka.consumer({ groupId });

async function ensureTopics(): Promise<void> {
  const admin = kafka.admin();
  try {
    await admin.connect();
    const topicNames = [TOPICS.TASKS, TOPICS.EVENTS, TOPICS.TASK_EVENTS];
    const topics = topicNames.map((t) => ({ topic: t, numPartitions: 1, replicationFactor: 1 }));
    await admin.createTopics({ topics, waitForLeaders: true });
  } catch (err) {
    // ignore topic-exists errors, but log others
    console.warn('ensureTopics warning:', (err as Error).message || err);
  } finally {
    try { await admin.disconnect(); } catch (e) {}
  }
}

async function startKafkaConsumer(): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.EVENTS, fromBeginning: false });

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
  // Ensure topics exist before connecting
  await ensureTopics();
  await producer.connect();
}

async function publishTask(task: unknown) {
  const value = typeof task === 'string' ? task : JSON.stringify(task);
  return producer.send({ topic: TOPICS.TASKS, messages: [{ value }] });
}

async function shutdown() {
  try { await producer.disconnect(); } catch (e) {}
  try { await consumer.disconnect(); } catch (e) {}
}

export { startKafkaConsumer, startKafkaProducer, publishTask, shutdown };
