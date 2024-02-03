import express from 'express';
import {
  registerWorker,
  loginWorker,
  verifyWorkerEmail,
  workerForgotPassword,
  allowWorkerResetPassword,
  workerResetPassword,
  getWorker,
  updateWorker,
  getDoctors,
} from '../controllers/workersController.js';
import { authToken } from '../utils/verifyToken.js';
import multerUpload from '../middlewares/multer.js';

const router = express.Router();

router.post('/register-worker', registerWorker);
router.put(
  '/update-worker',
  authToken,
  multerUpload.single('profileImg'),
  updateWorker
);
router.get('/get-worker', authToken, getWorker);
router.get('/get-doctors', getDoctors);
router.get('/confirm/:workerId/:token', verifyWorkerEmail);
router.post('/login-worker', loginWorker);

router.post('/forgot-password', workerForgotPassword);
router.post('/:workerId/reset-password/:token', workerResetPassword);
router.post('/:workerId/allow-reset-password/:token', allowWorkerResetPassword);

export default router;
