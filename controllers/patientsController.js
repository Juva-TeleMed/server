import Patients from '../models/patientsModel.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PatientsToken } from '../models/tokenModel.js';
import { sendEmail } from '../utils/nodemailer.js';
import { error } from 'console';
import { generateToken } from '../utils/verifyToken.js';

const registerPatient = async (req, res) => {
  try {
    // registration logic here
    const { fullName, email, password, phoneNumber } = req.body;

    // check if all fields are not empty
    if (!fullName || !email || !password || !phoneNumber) {
      return res.json({
        message: 'All fields are required',
        status: 400,
        success: false,
      });
    }

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    // check for valid email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        success: false,
        status: 400,
      });
    }

    // check the fullName field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9 -]+$/.test(trimmedFullName)) {
      return res.json({
        message: 'Invalid input for fullName...',
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
      fullName,
      email,
      phoneNumber,
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

export { verifyPatientEmail, registerPatient, loginPatient };
