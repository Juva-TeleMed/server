import express from 'express';
import {
  registerWorker,
  loginWorker,
  verifyWorkerEmail,
  forgotPassword
} from '../controllers/workersController.js';

const router = express.Router();

router.post('/register-worker', registerWorker);
router.get('/confirm/:workerId/:token', verifyWorkerEmail);
router.post('/login-worker', loginWorker);
router.post('/forgot-password', forgotPassword);


export default router;
