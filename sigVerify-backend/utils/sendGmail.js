const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
require('dotenv').config();

// Define your OAuth2 credentials
const YOUR_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const YOUR_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const YOUR_REFRESH_TOKEN = process.env.GOOGLE_OAUTH_CLIENT_REFRESH_TOKEN;

const oauth2Client = new OAuth2(
    YOUR_CLIENT_ID,
    YOUR_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: YOUR_REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Exportable sendEmail function
exports.sendEmail = (to, subject, message, callback) => {
    // Create the email body in base64URL format
    const raw = Buffer.from(
        `To: ${to}\r\n` +
        `Subject: ${subject}\r\n\r\n` +
        message
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: raw
        }
    }, callback);
};
