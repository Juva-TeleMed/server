import express from 'express';
import {
  registerWorker,
  loginWorker,
} from '../controllers/workersController.js';

const router = express.Router();

router.post('register-worker', registerWorker);
router.post('login-worker', loginWorker);

export default router;
