import nodemailer from 'nodemailer';


const sentEmail = async (option) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const emailOption = {
        from: "Juva-med Support<support@juva-med.com>",
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await transporter.sendMail(emailOption)
};


export default sentEmail