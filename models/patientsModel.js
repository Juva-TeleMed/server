import mongoose from 'mongoose';
import crypto from 'crypto'


const patientsSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
  },
  { timestamps: true }
);


patientsSchema.methods.createResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex")

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest("hex")
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000 // expire in 10 minutes

  return resetToken;

}


const Patients = mongoose.model('Patients', patientsSchema);
export default Patients;
