import Patients from '../models/patientsModel.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PatientsToken } from '../models/tokenModel.js';
import { changePassword, sendEmail } from '../utils/nodemailer.js';
import { error } from 'console';
import { generateToken } from '../utils/verifyToken.js';
import { handleFileUpload } from '../utils/cloudinary.js';

const registerPatient = async (req, res) => {
  try {
    // registration logic here
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      confirmPassword,
    } = req.body;

    console.log(req.body);

    // check if all fields are not empty
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword
      // !phoneNumber
    ) {
      return res.json({
        message: 'All fields are required',
        status: 400,
        success: false,
      });
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    // check for valid email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        success: false,
        status: 400,
      });
    }

    // check the firstName field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9 -]+$/.test(trimmedFirstName)) {
      return res.json({
        message: 'Invalid input for firstName...',
        status: 400,
        success: false,
      });
    }

    // check the lastName field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9 -]+$/.test(trimmedLastName)) {
      return res.json({
        message: 'Invalid input for lastName...',
        status: 400,
        success: false,
      });
    }

    // strong password check
    if (
      !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
        password
      )
    ) {
      return res.json({
        message:
          'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters',
        success: false,
        status: 401,
      });
    }

    // check password match
    if (password !== confirmPassword) {
      return res.json({
        message: 'Password do not match',
        status: 400,
        success: false,
      });
    }

    // check if email exist
    const emailExist = await Patients.findOne({ email });

    if (emailExist) {
      return res.json({
        message: 'Email already exist...',
        status: 400,
        success: false,
      });
    }

    //  hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newPatient = await new Patients({
      firstName,
      lastName,
      email,
      // phoneNumber,
      password: hashedPassword,
    }).save();

    // generate email verification link and send
    const token =
      crypto.randomBytes(32).toString('hex') +
      crypto.randomBytes(32).toString('hex');

    const newToken = await new PatientsToken({
      userId: newPatient._id,
      token,
    }).save();

    const link = `${process.env.FRONTEND}/api/patients/confirm/${newToken.userId}/${newToken.token}`;
    // const link = `${process.env.FRONTEND}/confirm/?patientId=${newToken.userId}&token=${newToken.token}`;

    // send email verification link to patient email address using nodemailer
    sendEmail(newPatient.email, link);

    return res.json({
      message: 'Please open your email to verify your email',
      success: true,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

// email verification for patients
const verifyPatientEmail = async (req, res) => {
  try {
    const { patientId, token } = req.params;

    const tokenExist = await PatientsToken.findOne({
      token,
      userId: patientId,
    });

    if (!tokenExist) {
      return res.json({
        message: 'Token can not be found',
        success: false,
        status: 404,
      });
    }

    const patientExist = await Patients.findByIdAndUpdate(
      { _id: patientId },
      {
        $set: {
          isVerified: true,
        },
      },
      { new: true }
    );

    if (!patientExist) {
      return res.json({
        message: 'Patient can not be found',
        status: 404,
        success: false,
      });
    }

    const deleteToken = await tokenExist.deleteOne();

    const { password: hashedPassword, ...others } = patientExist._doc;

    return res.json({
      message: 'Email verification successful',
      status: 200,
      success: true,
      patient: others,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

// login patient
const loginPatient = async (req, res) => {
  try {
    // login logic here
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        message: 'All fields are required...',
        status: 400,
        success: false,
      });
    }

    const trimmedEmail = email.trim();

    // check for valid email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        success: false,
        status: 400,
      });
    }

    // strong password check
    if (
      !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
        password
      )
    ) {
      return res.json({
        message:
          'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters',
        success: false,
        status: 401,
      });
    }

    const patient = await Patients.findOne({ email });

    if (!patient) {
      return res.json({
        message: 'Invalid credentials',
        status: 404,
        success: false,
      });
    }

    const validatePassword = await bcrypt.compare(password, patient.password);
    if (!validatePassword) {
      return res.json({
        message: 'Invalid credentials',
        success: false,
        status: 404,
      });
    }

    // check if patient has a verified email
    if (patient.isVerified === false) {
      // check whether he has token
      const token = await PatientsToken.findOne({
        userId: patient._id,
      });

      if (token) {
        return res.json({
          message: 'Please verify the mail sent to you',
        });
      }
      // generate another token
      const createToken =
        crypto.randomBytes(32).toString('hex') +
        crypto.randomBytes(32).toString('hex');

      const newToken = await PatientsToken({
        token: createToken,
        userId: patient._id,
      }).save();

      const link = `${process.env.FRONTEND}/api/patients/confirm/${newToken.userId}/${newToken.token}`;

      sendEmail(patient.email, link);
      return res.json({
        message:
          'Please visit your email for the verification link sent to you',
      });
    }

    // generate access token and send as httpOnly to the client
    generateToken(res, patient);

    const { password: hashedPassword, ...others } = patient._doc;

    return res.json({
      message: 'Login successful',
      success: true,
      status: 200,
      patient: others,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      success: false,
      status: 500,
    });
  }
};

// forgot password
const patientForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({
        message: 'Please input your email...',
        status: 400,
        success: false,
      });
    }

    const trimmedEmail = email.trim();
    // check for valid email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        status: 401,
        success: false,
      });
    }

    const patient = await Patients.findOne({ email: trimmedEmail });

    if (!patient) {
      return res.json({
        message: 'Patient does not exist',
        success: false,
        status: 404,
      });
    }

    // check if token exist to know if reset link has been sent before
    const tokenExist = await PatientsToken.findOne({ userId: patient._id });

    if (!tokenExist) {
      const token =
        crypto.randomBytes(32).toString('hex') +
        crypto.randomBytes(32).toString('hex');

      const newToken = await new PatientsToken({
        userId: patient._id,
        token,
      }).save();

      // link to be sent to patient
      const link = `${process.env.FRONTEND}/api/patients/${newToken.userId}/allow-reset-password/${newToken.token}`;

      changePassword(email, link);

      return res.json({
        message: 'Password reset link has been sent to your email address',
        status: 200,
        success: true,
      });
    }

    const link = `${process.env.FRONTEND}/api/patients/${newToken.userId}/allow-reset-password/${newToken.token}`;
    changePassword(email, link);

    return res.json({
      message: 'Password reset link has been sent again to your email address ',
      status: 200,
      success: true,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

// allow reset password
const allowPatientResetPassword = async (req, res) => {
  try {
    const { patientId, token } = req.params;

    const confirmToken = await PatientsToken.findOne({
      token,
      userId: patientId,
    });

    if (!confirmToken) {
      return res.json({
        message: 'You do not have permission to do this',
        status: 403,
        success: false,
      });
    }

    const patient = await Patients.findOne({ _id: patientId });
    if (!patient) {
      return res.json({
        message: 'This patient does not exist',
        success: false,
        status: 404,
      });
    }

    const { _id, ...others } = patient._doc;

    return res.json({
      message: 'Patient fetched successfully',
      success: true,
      status: 200,
      patientId: _id,
      token,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      success: false,
      status: 500,
    });
  }
};

// reset password
const patientResetPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;
    if (!newPassword || !confirmNewPassword) {
      return res.json({
        message: 'All fields can not be empty',
        success: false,
        status: 401,
      });
    }
    // strong password check
    if (
      !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
        newPassword
      )
    ) {
      return res.json({
        message:
          'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters',
        success: false,
        status: 401,
      });
    }
    if (newPassword !== confirmNewPassword) {
      return res.json({
        message: 'Password and confirm password do not match',
        status: 401,
        success: false,
      });
    }
    const { patientId, token } = req.params;
    const confirmToken = await PatientsToken.findOne({
      token,
      userId: patientId,
    });

    if (!confirmToken) {
      return res.json({
        message: 'You do not have permission to do this',
        status: 403,
        success: false,
      });
    }

    const patient = await Patients.findOne({ _id: patientId });
    if (!patient) {
      return res.json({
        message: 'This patient does not exist',
        success: false,
        status: 404,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const newPatientPassword = await Patients.findByIdAndUpdate(
      {
        _id: patient._id,
      },
      { password: hashedPassword }
    );

    await PatientsToken.deleteOne({
      token,
    });

    return res.json({
      message: 'Password changed successfully. You can now login',
      success: true,
      status: 200,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

// get patient
const getPatient = async (req, res) => {
  try {
    const user = req.user._id;
    const patient = await Patients.findById({ _id: user });
    if (!patient) {
      return res.json({
        message: 'Patient can not be found',
        status: 404,
        success: false,
      });
    }

    const { password, ...others } = patient._doc;
    return res.json({
      message: 'Patient fetched successfully',
      success: true,
      status: 200,
      patient: others,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

// update patient
const updatePatient = async (req, res) => {
  try {
    const {
      existingMedCondition,
      medications,
      allergies,
      surgicalHistory,
      address,
      nextOfKin,
      addressOfNextOfKin,
      relationshipWithNextOfKin,
    } = req.body;

    const profileImg = req.file;

    if (
      !existingMedCondition ||
      !medications ||
      !allergies ||
      !surgicalHistory ||
      !address ||
      !nextOfKin ||
      !addressOfNextOfKin ||
      !relationshipWithNextOfKin
    ) {
      return res.json({
        message: 'All fields are required',
        status: 400,
        success: false,
      });
    }

    // accept only one profile image
    if (profileImg.length === 0) {
      return res.json({
        message: 'Profile image can not be empty ',
        status: 400,
        success: false,
      });
    }

    // accept only one profile image
    if (profileImg.length > 1) {
      return res.json({
        message: 'Only one Profile image is accepted',
        status: 400,
        success: false,
      });
    }
    const trimmedAddress = address.trim();
    const trimmedExistingMedCondition = existingMedCondition.trim();
    const trimmedMedications = medications.trim();
    const trimmedAllergies = allergies.trim();
    const trimmedSurgicalHistory = surgicalHistory.trim();
    const trimmedNextOfKin = nextOfKin.trim();
    const trimmedAddressOfNextOfKin = addressOfNextOfKin.trim();
    const trimmedRelationshipWithNextOfKin = relationshipWithNextOfKin.trim();

    // check the Address of next of kin field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#]+$/u.test(trimmedAddressOfNextOfKin)) {
      return res.json({
        message: 'Invalid input for address of next of kin...',
        status: 400,
        success: false,
      });
    }

    // check the relationship with next of kin field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#]+$/u.test(trimmedRelationshipWithNextOfKin)) {
      return res.json({
        message: 'Invalid input for relationship with next of kin...',
        status: 400,
        success: false,
      });
    }

    // check the Address field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#]+$/u.test(trimmedAddress)) {
      return res.json({
        message: 'Invalid input for address...',
        status: 400,
        success: false,
      });
    }

    // check the Existing medical condition field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#]+$/u.test(trimmedExistingMedCondition)) {
      return res.json({
        message: 'Invalid input for existing medical condition...',
        status: 400,
        success: false,
      });
    }

    // check the Medications field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#]+$/u.test(trimmedMedications)) {
      return res.json({
        message: 'Invalid input for Medications...',
        status: 400,
        success: false,
      });
    }

    // check the Allergies field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#]+$/u.test(trimmedAllergies)) {
      return res.json({
        message: 'Invalid input for allergies...',
        status: 400,
        success: false,
      });
    }

    // check the surgical history field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#]+$/u.test(trimmedSurgicalHistory)) {
      return res.json({
        message: 'Invalid input for surgical history...',
        status: 400,
        success: false,
      });
    }

    // check the next-of-kin field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#]+$/u.test(trimmedNextOfKin)) {
      return res.json({
        message: 'Invalid input for next-of-kin...',
        status: 400,
        success: false,
      });
    }

    const patient = await Patients.findById({ _id: req.user._id });

    if (!patient) {
      return res.json({
        message: 'Patient can not be found',
        status: 404,
        success: false,
      });
    }

    const result = await handleFileUpload(req, res);

    const patientUpdate = await Patients.findByIdAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          address: trimmedAddress,
          existingMedCondition: trimmedExistingMedCondition,
          medications: trimmedMedications,
          allergies: trimmedAllergies,
          surgicalHistory: trimmedSurgicalHistory,
          nextOfKin: trimmedNextOfKin,
          addressOfNextOfKin: trimmedAddressOfNextOfKin,
          relationshipWithNextOfKin: trimmedRelationshipWithNextOfKin,
          profileImg: result,
          isUpdated: true,
        },
      },
      { new: true }
    );

    if (!patientUpdate) {
      return res.json({
        message: 'Error updating patient',
        status: 400,
        success: false,
      });
    }

    const { password, ...others } = patientUpdate._doc;
    return res.json({
      message: 'Patient updated successfully',
      success: true,
      status: 200,
      patient: others,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

// booking appointment
const bookAppointment = async (req, res) => {
  try {
    // const {preferredDoctor, preferredTime, availableTime}
  } catch (error) {
    return res.json({
      message: 'Something happened',
      success: false,
      status: false,
    });
  }
};

export {
  allowPatientResetPassword,
  patientForgotPassword,
  patientResetPassword,
  getPatient,
  verifyPatientEmail,
  registerPatient,
  loginPatient,
  updatePatient,
};
