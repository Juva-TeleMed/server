import Workers from '../models/workersModel.js';
const registerWorker = async (req, res) => {
  try {
    // registration logic here
  } catch (error) {
    return res.json({
      message: 'Something happened',
      success: false,
      status: 500,
    });
  }
};

const loginWorker = async (req, res) => {
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

export { loginWorker, registerWorker };
