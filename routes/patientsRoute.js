import express from 'express';
import {
  registerPatient,
  loginPatient,
  verifyPatientEmail,
  forgotPassword,
  resetPassword
} from '../controllers/patientsController.js';
import { authToken } from '../utils/verifyToken.js';

const router = express.Router();

router.post('/register-patient', registerPatient);
router.post('/login-patient', loginPatient);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.get('/confirm/:patientId/:token', verifyPatientEmail);


export default router;
