import nodemailer from 'nodemailer';

// Validate required environment variables for both environments
const env = process.env.NODE_ENV || 'development'; // Default to development if not set

const requiredEnvVars =
    env === 'production'
        ? ['PROD_MAIL_USERNAME', 'PROD_MAIL_PASSWORD']
        : ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_FROM_NAME', 'MAIL_FROM_ADDRESS'];

requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`Environment variable ${varName} is required`);
    }
});

// Configure transport based on environment
const transporter = nodemailer.createTransport({
    service: env === 'production' ? 'gmail' : undefined,
    host: env === 'production' ? 'smtp.gmail.com' : process.env.MAIL_HOST,
    port: env === 'production' ? 587 : process.env.MAIL_PORT,
    secure: false, // true for port 465, false for port 587
    auth: {
        user: env === 'production' ? `${process.env.PROD_MAIL_USERNAME}` : process.env.MAIL_USERNAME,
        pass: env === 'production' ? `${process.env.PROD_MAIL_PASSWORD}` : process.env.MAIL_PASSWORD,
    },
});

const sendEmail = (to, subject, message, callback) => {
    const mailOptions = {
        from:
            env === 'production'
                ? {
                      name: 'Sig Verify',
                      address: process.env.PROD_MAIL_USERNAME,
                  }
                : `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: to,
        subject: subject,
        text: message.replace(/<\/?[^>]+(>|$)/g, ''), // Strip HTML to create plain text version
        html: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (callback) {
            callback(error, info);
        }
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info);
        }
    });
};

export { sendEmail };
