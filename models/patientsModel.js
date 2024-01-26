import mongoose from 'mongoose';

const patientsSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Patients = mongoose.model('Patients', patientsSchema);
export default Patients;
