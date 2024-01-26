import nodemailer from 'nodemailer';

const sendEmail = async (email, link) => {
  try {
    //  create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.SECURE,
      service: process.env.SERVICE,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const info = transporter.sendMail({
      sender: process.env.USER,
      to: email,
      subject: 'Email verification',
      html: `
      <div>
      <h1>Thank you for registering on our website.</h1>
      <a href=${link}>Click here to verify your email</a>
      </div>
      `,
    });
  } catch (error) {
    console.log(error);
  }
};

export { sendEmail };
