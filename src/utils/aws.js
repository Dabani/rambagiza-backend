import aws from 'aws-sdk';
import multer from 'multer';
import multers3 from 'multer-s3';

const { config, S3 } = aws

config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export const uploadImage = multer({
  storage: multers3({
    s3: new S3({}),
    bucket: 'rambagiza-online',
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, file.originalname);
    },
    rename: (fieldName, fileName) => {
      return fileName.replace(/\w+/g, '-').toLowerCase();
    }
  })
});

