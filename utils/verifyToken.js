import jwt from 'jsonwebtoken';

const generateToken = async (res, user) => {
  try {
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '3600s' }
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1 * 1000,
      sameSite: 'None',
      // sameSite: 'strict,
<<<<<<< HEAD
      // secure: false, // Include this if your app is served over HTTP
      secure: true, // Include this if your app is served over HTTPS
    });

    return { token, user };
=======
     // secure: false, // Include this if your app is served over HTTP
      secure: true, // Include this if your app is served over HTTPS
    });
    return {token, user}
>>>>>>> 3680b9661b9fb8c86f723951e937ed62ca0004c4
  } catch (error) {
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

const authToken = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.json({
        message: 'Please login to continue',
        status: 400,
        success: false,
      });
    }

    await jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.json({
          message: 'Invalid token',
          status: 401,
          success: false,
          err,
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.log(error);
    return;
  }
};

export { generateToken, authToken };
