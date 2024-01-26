import express from 'express';
import {
  registerPatient,
  loginPatient,
} from '../controllers/patientsController.js';

const router = express.Router();

router.post('register-patient', registerPatient);
router.post('login-patient', loginPatient);

export default router;
