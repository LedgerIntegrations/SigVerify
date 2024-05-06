import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
});

const upload = multer({
    storage: multerS3({
        s3: client,
        bucket: process.env.S3_BUCKET_NAME,
        key: function (req, file, cb) {
            console.log(file);
            cb(null, Date.now().toString() + '-' + file.originalname);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
});

const returnSignedUrlFromS3BucketKey = async (documentKey) => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: documentKey,
            Expires: 60 * 5, // URL expires in 5 minutes
        });
        const signedUrl = await getSignedUrl(client, command);
        return signedUrl;
    } catch (err) {
        console.error('Error generating presigned URL', err);
        throw err;
    }
};

export { upload, returnSignedUrlFromS3BucketKey };