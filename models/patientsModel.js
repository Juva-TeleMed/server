import mongoose from 'mongoose';

const patientsSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isUpdated: { type: Boolean, default: false },
    profileImg: {
      url: { type: String },
      publicId: { type: String },
      signature: { type: String },
      assetId: { type: String },
    },
    address: { type: String },
    medCondition: { type: String },
    medications: { type: String },
    allergies: { type: String },
    surgicalHistory: { type: String },
    nextOfKin: { type: String },
    addressOfNextOfKin: { type: String },
    relationshipWithNextOfKin: { type: String },
    bloodPressure: { type: String },
    weight: { type: String },
    temperature: { type: String },
    respiratoryRate: { type: Number },
    sleepTime: { type: Date },
    pulse: { type: Number },
    height: { type: Number },
    bloodGlucoseLevel: { type: Number },
    bloodOxygen: { type: Number },
    bloodAllergies: { type: String },

    // phoneNumber: {
    //   countryCode: { type: String },
    //   number: { type: String, required: true },
    // }, // i have to make country code optional here
  },
  { timestamps: true }
);

const Patients = mongoose.model('Patients', patientsSchema);
export default Patients;
