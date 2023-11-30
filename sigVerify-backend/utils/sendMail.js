const nodemailer = require('nodemailer');

// Validate required environment variables
const requiredEnvVars = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_FROM_NAME', 'MAIL_FROM_ADDRESS'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Environment variable ${varName} is required`);
  }
});

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
});

exports.sendEmail = (to, subject, message, callback) =>
{
    const mailOptions =
    {
        'from': `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        'to': to,
        'subject': subject,
        'html': message
    };

    transporter.sendMail(mailOptions, callback);
};
