import mongoose from 'mongoose';

const workersSchema = new mongoose.Schema(
  {
    names: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  { timestamps: true }
);

const Workers = mongoose.model('Workers', workersSchema);
export default Workers;
