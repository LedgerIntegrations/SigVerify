const nodemailer = require('nodemailer');

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
    
    transporter.sendMail(mailOptions, (error, info) => 
    {
        if (error) 
        {
            return console.error('Error sending mail:', error.message);
        }
        
        console.log('Mail sent:', info.messageId);
    });
};
