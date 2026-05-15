import express from 'express';
import { listEvents } from '../controllers/eventsController';

const router = express.Router();

router.get('/', listEvents);

export default router;
