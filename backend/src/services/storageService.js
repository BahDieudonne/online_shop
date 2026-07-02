/**
 * Storage Service switches between local, Cloudinary, S3, GCS
 * based on STORAGE_PROVIDER env variable
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const provider = process.env.STORAGE_PROVIDER || 'local';

let cloudinary;
let s3;

if (provider === 'cloudinary') {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else if (provider === 's3') {
  const { S3Client } = require('@aws-sdk/client-s3');
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

exports.uploadFile = async (file, folder = 'chancelor-store') => {
  // Compress & resize with sharp
  const processed = await sharp(file.buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const thumbnail = await sharp(file.buffer)
    .resize(400, 400, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  if (provider === 'cloudinary') {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', format: 'webp' },
        (err, res) => err ? reject(err) : resolve(res)
      ).end(processed);
    });
    return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' };
  }

  if (provider === 's3') {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    const key = `${folder}/${uuidv4()}.webp`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: processed,
      ContentType: 'image/webp',
      ACL: 'public-read',
    }));
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return { url, publicId: key, provider: 's3' };
  }

  // Local storage (default)
  const uploadDir = path.join(__dirname, '../../..', process.env.UPLOAD_DIR || 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, processed);

  const thumbDir = path.join(uploadDir, 'thumbnails');
  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir);
  fs.writeFileSync(path.join(thumbDir, filename), thumbnail);

  return {
    url: `/uploads/${filename}`,
    thumbnailUrl: `/uploads/thumbnails/${filename}`,
    publicId: filename,
    provider: 'local',
  };
};

exports.deleteFile = async (publicId) => {
  if (provider === 'cloudinary' && cloudinary) {
    await cloudinary.uploader.destroy(publicId);
  } else if (provider === 's3' && s3) {
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: publicId }));
  } else {
    const filepath = path.join(__dirname, '../../..', process.env.UPLOAD_DIR || 'uploads', publicId);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  }
};
