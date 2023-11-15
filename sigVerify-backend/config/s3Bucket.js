const fs = require('fs');
const mime = require('mime-types'); //need this for the ContentType
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require('dotenv').config();

const bucketName = 'sigverify-1';
const client = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: process.env.S3_SIGVERIFY_1_BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.S3_SIGVERIFY_1_BUCKET_SECRET_KEY,
    }
});

const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (let chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};

exports.createFileObject = async (file) => {
    const newFilename = `${Date.now()}.${mime.extension(file.mimetype)}`;

    const params = {
        Bucket: bucketName,
        Key: newFilename,
        Body: file.buffer, // buffer from multer.memoryStorage()
        ContentType: file.mimetype, 
    };

    try {
        const results = await client.send(new PutObjectCommand(params));
        console.log(results); // response from S3 file upload
        
        return {results: results, documentKey: params.Key, file: file};
    } catch (error) {
        console.error("Error:", error);
        throw new Error('Error uploading to S3');
    }
};

exports.generatePresignedUrl = async (objectKey) => {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
    });

    try {
        // URL expires in 1 hour (3600 seconds)
        const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
        return presignedUrl
        // const data = await client.send(command);
        // const buffer = await streamToBuffer(data.Body);
        // const base64Data = buffer.toString('base64');
        // return { base64Data, contentType: data.ContentType, fileName: objectKey }

    } catch (error) {
        console.error("Error generating pre-signed URL", error);
        throw error;
    }
}