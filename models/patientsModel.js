import mongoose from 'mongoose';

const patientsSchema = new mongoose.Schema(
  {
    names: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  { timestamps: true }
);

const Patients = mongoose.model('Patients', patientsSchema);
export default Patients;
