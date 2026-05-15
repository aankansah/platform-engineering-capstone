import express from 'express';
import { getEvents } from '../kafkaClient';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ events: getEvents() });
});

export default router;
