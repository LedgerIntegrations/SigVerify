const sendAuthTokenEmail = async (email, token) => {
    return new Promise((resolve, reject) => {
        emailer.sendEmail(
            email,
            'SigVerify E-mail Verification',
            `Please Click Link to Verify email! \n http://localhost:5173/create-user/?token=${token}`,
            (err, res) => {
                if (err) {
                    console.log('The API returned an error:', err.message);
                    reject(err);
                } else {
                    console.log('Email sent:', res.data);
                    resolve(res);
                }
            }
        );
    });
};

export { sendAuthTokenEmail }