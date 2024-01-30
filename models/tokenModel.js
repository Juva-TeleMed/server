import mongoose, { Schema } from 'mongoose';

const patientsTokenSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Patients' },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), expires: 1800 },
});

const workersTokenSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Patients' },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), expires: 1800 },
});

const PatientsToken = mongoose.model('PatientsToken', patientsTokenSchema);
const WorkersToken = mongoose.model('WorkersToken', workersTokenSchema);
export { PatientsToken, WorkersToken };
