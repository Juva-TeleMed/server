import Patients from '../models/patientsModel.js';

const registerPatient = async (req, res) => {
  try {
    // registration logic here
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
  } catch (error) {
    return res.json({
      message: 'Something happened',
      success: false,
      status: 500,
    });
  }
};

export { registerPatient, loginPatient };
