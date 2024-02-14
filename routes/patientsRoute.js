import express from 'express';
import {
  registerPatient,
  loginPatient,
  verifyPatientEmail,
  getPatient,
  allowPatientResetPassword,
  patientForgotPassword,
  patientResetPassword,
  updatePatient,
  updateVitals,
} from '../controllers/patientsController.js';
import { authToken } from '../utils/verifyToken.js';
import multerUpload from '../middlewares/multer.js';

const router = express.Router();

router.post('/register-patient', registerPatient);
router.post('/login-patient', loginPatient);
router.put(
  '/update-patient',
  authToken,
  multerUpload.single('profileImg'),
  updatePatient
);

router.put('/update-vitals', authToken, updateVitals);
router.get('/get-patient', authToken, getPatient);
router.get('/confirm/:patientId/:token', verifyPatientEmail);

router.post('/forgot-password', patientForgotPassword);
router.post('/:patientId/reset-password/:token', patientResetPassword);
router.post(
  '/:patientId/allow-reset-password/:token',
  allowPatientResetPassword
);

export default router;
