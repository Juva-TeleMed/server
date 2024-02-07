import Workers from '../models/workersModel.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { changePassword, sendEmail } from '../utils/nodemailer.js';
import { WorkersToken } from '../models/tokenModel.js';
import { generateToken } from '../utils/verifyToken.js';
import { handleFileUpload } from '../utils/cloudinary.js';

// update worker
const updateWorker = async (req, res) => {
  try {
    const {
      existingMedCondition,
      medications,
      allergies,
      nextOfKin,
      addressOfNextOfKin,
      relationshipWithNextOfKin,
      gender,
      occupation,
      yearsOfExperience,
      weeklyAvailability,
      medicalLicenseNumber,
      department,
      dateOfBirth,
      address,
      areaOfExpertise,
    } = req.body;

    const profileImg = req.file;

    if (
      !existingMedCondition ||
      !medications ||
      !allergies ||
      !gender ||
      !dateOfBirth ||
      !department ||
      !yearsOfExperience ||
      !occupation ||
      !address ||
      !nextOfKin ||
      !addressOfNextOfKin ||
      !relationshipWithNextOfKin ||
      !weeklyAvailability ||
      !medicalLicenseNumber ||
      !areaOfExpertise
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
    const trimmedNextOfKin = nextOfKin.trim();
    const trimmedMedicalLicenseNumber = medicalLicenseNumber.trim();
    const trimmedYearsOfExperience = yearsOfExperience.trim();
    const trimmedAreaOfExpertise = areaOfExpertise.trim();
    const trimmedAddressOfNextOfKin = addressOfNextOfKin.trim();
    const trimmedRelationshipWithNextOfKin = relationshipWithNextOfKin.trim();

    // return res.json(trimmedMedicalLicenseNumber);

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

    // check the area of expertise field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#]+$/u.test(trimmedAreaOfExpertise)) {
      return res.json({
        message: 'Invalid input for area of expertise...',
        status: 400,
        success: false,
      });
    }

    // check the years of experience field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#]+$/u.test(trimmedYearsOfExperience)) {
      return res.json({
        message: 'Invalid input for years of experience...',
        status: 400,
        success: false,
      });
    }

    // check the medical license number field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#:]+$/u.test(trimmedMedicalLicenseNumber)) {
      return res.json({
        message: 'Invalid input for medical license number...',
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

    // check the next-of-kin field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9\s,.\-#]+$/u.test(trimmedNextOfKin)) {
      return res.json({
        message: 'Invalid input for next-of-kin...',
        status: 400,
        success: false,
      });
    }

    const doctor = await Workers.findById({ _id: req.user._id });

    if (!doctor) {
      return res.json({
        message: 'Doctor can not be found',
        status: 404,
        success: false,
      });
    }

    const result = await handleFileUpload(req, res);

    const doctorUpdate = await Workers.findByIdAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          gender,
          occupation,
          department,
          weeklyAvailability,
          dateOfBirth,
          yearsOfExperience: trimmedYearsOfExperience,
          addressOfNextOfKin: trimmedAddressOfNextOfKin,
          relationshipWithNextOfKin: trimmedRelationshipWithNextOfKin,
          areaOfExpertise: trimmedAreaOfExpertise,
          medicalLicenseNumber: trimmedMedicalLicenseNumber,
          address: trimmedAddress,
          existingMedCondition: trimmedExistingMedCondition,
          medications: trimmedMedications,
          allergies: trimmedAllergies,
          nextOfKin: trimmedNextOfKin,
          profileImg: result,
          isUpdated: true,
        },
      },
      { new: true }
    );

    if (!doctorUpdate) {
      return res.json({
        message: 'Error updating doctor',
        status: 400,
        success: false,
      });
    }

    console.log('3');
    return res.json({
      message: 'Doctor updated successfully',
      success: true,
      status: 200,
      doctorUpdate,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

// get all doctors
// frontend can display doctors details to patients by calling this endpoint
// patient can see the doctors that are available and time also will be displayed
// patient can click on the doctor for more info and booking of such doctor
const getDoctors = async (req, res) => {
  try {
    const doctors = await Workers.find();

    if (!doctors) {
      return res.json({
        message: 'No doctor found',
        status: 404,
        success: false,
      });
    }

    const doctorProfile = doctors.map(
      ({ _doc: { password, ...rest } }) => rest
    );

    return res.json({
      message: 'Doctors fetched successfully',
      status: 200,
      success: true,
      doctorProfile,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

// register new worker
const registerWorker = async (req, res) => {
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

    // check if all fields are not empty
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phoneNumber
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
    const emailExist = await Workers.findOne({ email });

    if (emailExist) {
      return res.json({
        message: 'Email already exist...',
        status: 400,
        success: false,
      });
    }

    //  hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newWorker = await new Workers({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
    }).save();

    // generate email verification link and send
    const token =
      crypto.randomBytes(32).toString('hex') +
      crypto.randomBytes(32).toString('hex');

    const newToken = await new WorkersToken({
      userId: newWorker._id,
      token,
    }).save();

    const link = `${process.env.FRONTEND}/api/workers/confirm/${newToken.userId}/${newToken.token}`;
    // const link = `${process.env.FRONTEND}/confirm/?patientId=${newToken.userId}&token=${newToken.token}`;

    // send email verification link to worker email address using nodemailer
    sendEmail(newWorker.email, link);

    return res.json({
      message: 'Please open your email to verify your email',
      success: true,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      success: false,
      status: 500,
    });
  }
};

// email verification for workers
const verifyWorkerEmail = async (req, res) => {
  try {
    const { workerId, token } = req.params;

    const tokenExist = await WorkersToken.findOne({
      token,
      userId: workerId,
    });

    if (!tokenExist) {
      return res.json({
        message: 'Token can not be found',
        success: false,
        status: 404,
      });
    }

    const workerExist = await Workers.findByIdAndUpdate(
      { _id: workerId },
      {
        $set: {
          isVerified: true,
        },
      },
      { new: true }
    );

    if (!workerExist) {
      return res.json({
        message: 'Worker can not be found',
        status: 404,
        success: false,
      });
    }

    const deleteToken = await tokenExist.deleteOne();

    const { password: hashedPassword, ...others } = workerExist._doc;

    return res.json({
      message: 'Email verification successful',
      status: 200,
      success: true,
      doctor: others,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

// Worker login
const loginWorker = async (req, res) => {
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

    const worker = await Workers.findOne({ email });

    if (!worker) {
      return res.json({
        message: 'Invalid credentials',
        status: 404,
        success: false,
      });
    }

    const validatePassword = await bcrypt.compare(password, worker.password);
    if (!validatePassword) {
      return res.json({
        message: 'Invalid credentials',
        success: false,
        status: 404,
      });
    }

    // check if patient has a verified email
    if (worker.isVerified === false) {
      // check whether he has token
      const token = await WorkersToken.findOne({
        userId: worker._id,
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

      const newToken = await WorkersToken({
        token: createToken,
        userId: worker._id,
      }).save();

      const link = `${process.env.FRONTEND}/api/workers/confirm/${newToken.userId}/${newToken.token}`;

      sendEmail(worker.email, link);
      return res.json({
        message:
          'Please visit your email for the verification link sent to you',
      });
    }

    // generate access token and send as httpOnly to the client
    generateToken(res, worker);

    const { password: hashedPassword, ...others } = worker._doc;

    return res.json({
      message: 'Login successful',
      success: true,
      status: 200,
      worker: others,
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
const workerForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({
        message: 'Please input your email...',
        status: 400,
        success: false,
      });
    }

    console.log('done 1');

    const trimmedEmail = email.trim();
    // check for valid email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        status: 401,
        success: false,
      });
    }

    const worker = await Workers.findOne({ email: trimmedEmail });

    if (!worker) {
      return res.json({
        message: 'Worker does not exist',
        success: false,
        status: 404,
      });
    }
    console.log('done 2');

    // check if token exist to know if reset link has been sent before
    const tokenExist = await WorkersToken.findOne({ userId: worker._id });

    if (!tokenExist) {
      const token =
        crypto.randomBytes(32).toString('hex') +
        crypto.randomBytes(32).toString('hex');

      const newToken = await new WorkersToken({
        userId: worker._id,
        token,
      }).save();

      console.log('done 3');
      // link to be sent to patient
      const link = `${process.env.FRONTEND}/api/workers/${newToken.userId}/allow-reset-password/${newToken.token}`;

      changePassword(email, link);

      console.log('done 4');
      return res.json({
        message: 'Password reset link has been sent to your email address',
        status: 200,
        success: true,
      });
    }

    console.log('done 5');
    const link = `${process.env.FRONTEND}/api/workers/${newToken.userId}/allow-reset-password/${newToken.token}`;
    changePassword(email, link);
    console.log('done 6');

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
const allowWorkerResetPassword = async (req, res) => {
  try {
    const { workerId, token } = req.params;

    const confirmToken = await WorkersToken.findOne({
      token,
      userId: workerId,
    });

    if (!confirmToken) {
      return res.json({
        message: 'You do not have permission to do this',
        status: 403,
        success: false,
      });
    }

    const worker = await Workers.findOne({ _id: workerId });
    if (!worker) {
      return res.json({
        message: 'This worker does not exist',
        success: false,
        status: 404,
      });
    }

    const { _id, ...others } = worker._doc;

    return res.json({
      message: 'Worker fetched successfully',
      success: true,
      status: 200,
      workerId: _id,
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
const workerResetPassword = async (req, res) => {
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
    const { workerId, token } = req.params;
    const confirmToken = await WorkersToken.findOne({
      token,
      userId: workerId,
    });

    if (!confirmToken) {
      return res.json({
        message: 'You do not have permission to do this',
        status: 403,
        success: false,
      });
    }

    const worker = await Workers.findOne({ _id: workerId });
    if (!worker) {
      return res.json({
        message: 'This worker does not exist',
        success: false,
        status: 404,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const newWorkerPassword = await Workers.findByIdAndUpdate(
      {
        _id: worker._id,
      },
      { password: hashedPassword }
    );

    await WorkersToken.deleteOne({
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

// get worker
const getWorker = async (req, res) => {
  try {
    const user = req.user._id;
    const doctor = await Workers.findById({ _id: user });
    if (!doctor) {
      return res.json({
        message: 'Doctor can not be found',
        status: 404,
        success: false,
      });
    }

    const { password, ...others } = doctor._doc;
    return res.json({
      message: 'Doctor fetched successfully',
      success: true,
      status: 200,
      doctor: others,
    });
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

export {
  updateWorker,
  allowWorkerResetPassword,
  workerForgotPassword,
  workerResetPassword,
  getWorker,
  verifyWorkerEmail,
  loginWorker,
  registerWorker,
  getDoctors,
};
