import mongoose from 'mongoose';

const workersSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    occupation: { type: String },
    department: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Workers = mongoose.model('Workers', workersSchema);
export default Workers;
