
//BASIC TEMPLATE
//NO TESTING OR CHECKS DONE AT ALL
//WILL GET TO THIS LATER

require('dotenv').config();
const {
    S3Client,
    PutObjectCommand,
    CreateBucketCommand,
    DeleteObjectCommand,
    DeleteBucketCommand,
    paginateListObjectsV2,
    GetObjectCommand,
} = require("@aws-sdk/client-s3");
const bucketName = 'sigverify-1';


const client = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: process.env.S3_SIGVERIFY_1_BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.S3_SIGVERIFY_1_BUCKET_SECRET_KEY,
    }
});

exports.createFileObject = async ( file ) => {
    const ext = file.originalFilename.split('.').pop();
    const newFilename = Date.now() + '.' + ext;

    await client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: newFilename,
        Body: fs.readFileSync(file.path),
        ACL: 'public-read',
        ContentType: mime.lookup(file.path),
    }));

};