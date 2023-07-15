require("dotenv").config();
const express = require("express");
const app = express();

const port = process.env.PORT || 3000;
const AWS = require("aws-sdk");
const { uploadFile, uploadFileToS3 } = require("./upload");

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);
app.post("/upload", uploadFile, async (req, res) => {
  const fileName = await uploadFileToS3(req);

  let html = `
  <html>
    <head>
      <title>File Upload</title>
    </head>
    <body>

      <h1>File Upload</h1>
      <img src="${fileName}"  alt = "upload file"/>

    </body>
  </html>
  `;

  res.send(html);
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
        response.json(data.Contents);
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
