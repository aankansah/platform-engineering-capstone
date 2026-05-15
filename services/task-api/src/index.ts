import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tasksRouter from './routes/tasks';
import eventsRouter from './routes/events';
import { startKafkaConsumer, startKafkaProducer, shutdown } from './kafkaClient';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);
app.use('/api/events', eventsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await startKafkaProducer();
    await startKafkaConsumer();
  } catch (err) {
    console.warn('Kafka start failed, continuing without Kafka:', (err as Error).message || err);
  }

  const server = app.listen(PORT, () => {
    console.log(`task-api listening on ${PORT}`);
  });

  const stop = async () => {
    console.log('shutting down...');
    server.close();
    await shutdown();
    process.exit(0);
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

start();
