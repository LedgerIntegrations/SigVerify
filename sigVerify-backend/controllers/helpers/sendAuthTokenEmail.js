import { sendEmail } from '../utils/index.js';

const sendAuthTokenEmail = async (email, token) => {
    const emailBody = `
        <html>
            <body>
                <p>Please click the link below to verify your email:</p>
                <a href="http://localhost:5173/create-user/?token=${token}" target="_blank">Verify Email</a>
                <p>If you did not request this, please ignore this email.</p>
            </body>
        </html>
    `;

    return new Promise((resolve, reject) => {
        sendEmail(email, 'SigVerify E-mail Verification', emailBody, (err, info) => {
            if (err) {
                console.error('The API returned an error: ', err.message);
                reject(err);
            } else {
                console.log('Email sent: ', info.response);
                resolve(info);
            }
        });
    });
};

export { sendAuthTokenEmail };