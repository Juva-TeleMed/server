import express from 'express';
import {
  registerPatient,
  loginPatient,
  verifyPatientEmail,
} from '../controllers/patientsController.js';
import { authToken } from '../utils/verifyToken.js';

const router = express.Router();

router.post('/register-patient', authToken, registerPatient);
router.post('/login-patient', loginPatient);
router.get('/confirm/:patientId/:token', verifyPatientEmail);

export default router;
