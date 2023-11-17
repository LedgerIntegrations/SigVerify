const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require('dotenv').config();

const client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    }
});

// Access Controls:
// acl: 'private' --> means the file is not publicly accessible. Need to generate pre-signed URL to view via URL.   
// versionId: 'undefined' --> versioning is not currently enabled.
// The contentType is set to 'application/octet-stream', which is a generic binary type. If you need to handle specific types of files differently, you might want to manage the contentType more precisely.
const upload = multer({
    storage: multerS3({
        s3: client,
        bucket: process.env.S3_BUCKET_NAME,
        key: function (req, file, cb) {
            console.log(file)
            // adding filename to end of timestamp to improve key randomness
            cb(null, Date.now().toString() + '-' + file.originalname);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE
    })
});

const retrieveS3BucketObjects = async (documentKeysAndDocumentNames) => {
    const urlsWithDocumentNames = await Promise.all(
        documentKeysAndDocumentNames.map(async (documentKeyAndDocumentName) => {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: documentKeyAndDocumentName.document_key,
            });
            return  { signedUrl: await getSignedUrl(client, command, { expiresIn: 7200 }), documentName: documentKeyAndDocumentName.document_name };
        })
    );
    return urlsWithDocumentNames;
};

module.exports = { upload, retrieveS3BucketObjects };
