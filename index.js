require("dotenv").config();
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const port = process.env.PORT || 4000;
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: process.env.AWS_ENDPOINT,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3BucketEndpoint: true,
});
app.use(
  fileUpload({
    createParentPath: true,
  })
);
// Handle files
app.post("/upload", function (request, response) {
  const file = request?.files?.["fileToUpload"] || null;

  // Return if the request doesn't contain the file
  if (!file) return response.sendStatus(400);

  // Destructure the content of the file object
  const { name, mimetype, size, data } = file;
  const fileContent = Buffer.from(data, " ");

  /* Add security checks (e.g. max size) here */

  s3.putObject(
    {
      Body: fileContent, // The actual file content
      Bucket: process.env.AWS_BUCKET_NAME, // The name of the bucket
      Key: name, // The name of the file
    },
    function (err, data) {
      if (err) {
        response.sendStatus(500);
      } else {
        response.status(200).json({
          data,
        });
      }
    }
  );
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/form.html");
});
// Show all files
app.get("/list", function (request, response) {
  // Get all objects inside the bucket
  s3.listObjects(
    {
      Bucket: process.env.AWS_BUCKET_NAME,
    },
    function (err, data) {
      if (err) {
        response.sendStatus(500);
      } else {
        // Return the list ("Contents") as JSON
        response.json(data.Contents);
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
