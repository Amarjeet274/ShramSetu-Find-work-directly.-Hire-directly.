const fs = require('fs/promises');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

let s3;
if (process.env.STORAGE_DRIVER === 's3') {
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

exports.putFile = async (file) => {
  if (process.env.STORAGE_DRIVER === 's3') {
    const key = `uploads/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${file.originalname}`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private',
    }));
    return {
      key,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      storage: 's3',
    };
  }
  // local
  return { key: file.filename, url: `/uploads/${file.filename}`, storage: 'local' };
};

exports.deleteFile = async (key) => {
  if (process.env.STORAGE_DRIVER === 's3') {
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
    return;
  }
  try { await fs.unlink(path.join(process.cwd(), 'uploads', key)); } catch {}
};