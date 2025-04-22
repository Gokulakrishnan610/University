import express from 'express';
import { getHealthStatus } from '../controllers/healthController';

const router = express.Router();

router.get('/', getHealthStatus);

export default router; 