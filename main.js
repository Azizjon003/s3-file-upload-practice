require("dotenv").config();
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const port = process.env.PORT || 4000;
const {
  S3Client,
  PutObjectCommand,
  ListObjectsCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  // region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.use(fileUpload({ createParentPath: true }));

// Handle file uploads
app.post("/upload", async function (request, response) {
  const file = request?.files?.fileToUpload;

  // Return if the request doesn't contain a file
  if (!file) return response.sendStatus(400);

  // Destructure the content of the file object
  const { name, data } = file;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: name,
        Body: data,
      })
    );
    response.sendStatus(200);
  } catch (error) {
    console.error(error);
    response.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/form.html");
});

// List all files in the S3 bucket
app.get("/list", async function (request, response) {
  try {
    const data = await s3.send(
      new ListObjectsCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
      })
    );
    response.json(data.Contents);
  } catch (error) {
    console.error(error);
    response.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
