import mongoose from 'mongoose';

const workersSchema = new mongoose.Schema(
  {
    // 5) NATIONALITY
    // 11) BOARD CERTIFICATIONS
    // 12) MEDICAL EDUCATION DETAILS
    // 13) RESIDENCY AND FELLOWSHIP INFORMATION
    // 14) PROFESSIONAL EXPERIENCE
    // 15) WORK HISTORY
    // 17) PREVIOUS TELEMEDiCINE EXPERIENCE
    // 19) LANGUAGE SPOKEN
    // 20) AREAS OF FOCUS OR SPECIALIZATION IN TREATMENT

    gender: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    occupation: { type: String },
    department: { type: String },
    dateOfBirth: { type: Date },
    profileImg: {
      url: { type: String },
      publicId: { type: String },
      signature: { type: String },
      assetId: { type: String },
    },
    address: { type: String },
    areaOfExpertise: { type: String },
    medicalLicenseNumber: { type: String },
    yearsOfExperience: { type: String },
    weeklyAvailability: [
      {
        dayOfWeek: { type: String },
        timeAvailable: [
          {
            startTime: { type: String },
            endTime: { type: String },
          },
        ],
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isDoctor: {
      type: Boolean,
      default: false,
    },

    //     weeklyAvailability[0][dayOfWeek]: Monday
    // weeklyAvailability[0][availableTimeSlots][0][startTime]: 09:00 AM
    // weeklyAvailability[0][availableTimeSlots][0][endTime]: 12:00 PM
    // weeklyAvailability[0][availableTimeSlots][1][startTime]: 02:00 PM
    // weeklyAvailability[0][availableTimeSlots][1][endTime]: 05:00 PM

    nextOfKin: { type: String },
    addressOfNextOfKin: { type: String },
    relationshipWithNextOfKin: { type: String },
    wallet: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isUpdated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Workers = mongoose.model('Workers', workersSchema);
export default Workers;
