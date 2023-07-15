const multer = require("multer");
const util = require("util");
let AWS = require("aws-sdk");
const path = require("path");
require("dotenv").config();

const s3 = new AWS.S3({
  endpoint: process.env.AWS_ENDPOINT,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3BucketEndpoint: true,
});
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  const fileName = `${randomString}_${timestamp}.${extension}`;
  return fileName;
};
const uploadFileToS3 = async (req) => {
  try {
    const image = req.file;
    const fileName = generateFileName(image.originalname);
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || "",
      Key: fileName,
      Body: image.buffer,
      ACL: "public-read",
    };
    const data = await s3.putObject(params).promise();
    return `${process.env.AWS_URL}${fileName}`;
  } catch (err) {
    return null;
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
  fileFilter: async function (req, file, cb) {
    console.log(file);
    const filetypes = /png|jpg|jpeg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(new Error("Fayl turi noto‘g‘ri!"));
  },
});

const uploadFile = util.promisify(upload.single("image"));

module.exports = {
  uploadFile,
  uploadFileToS3,
  generateFileName,
};
