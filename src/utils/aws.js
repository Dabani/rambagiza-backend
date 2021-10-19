import AwsSdk from 'aws-sdk'
import Multer from 'multer'
import MulterS3 from 'multer-s3'

const { aws } = AwsSdk
const { multer } = Multer
const { multers3} = MulterS3

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports = {
  uploadImage: multer({
    storage: multers3({
      s3: new aws.S3({}),
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
  })
};

