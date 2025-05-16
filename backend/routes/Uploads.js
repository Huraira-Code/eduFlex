const express = require("express");
const { cloudinary } = require("../middlewares/cloudinary");
streamifier = require("streamifier");
const route = express.Router();
const multer = require("multer");
// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for processing
const upload = multer({ storage });

route.post("/", async (req, res) => {
  try {
    let timeStamp = new Date();
    timeStamp = timeStamp.toJSON();

    // Set folder for uploads
    let day = timeStamp.substring(0, 10);
    console.log("dataurl", req.body);
    let promise = await cloudinary.v2.uploader.upload(req.body.dataUrl, {
      public_id: `${day}/files-${timeStamp}`,
      tags: "files", // tag
    });
    console.log("finish loading", promise);
    console.log("promise", promise);
    return res.json(promise);
  } catch (err) {
    console.log("err", err);
    res.send({ error: err });
  }
});

route.post("/uploadAdvance", upload.array("files"), async (req, res) => {
  try {
    const uploadedFiles = [];
    const timeStamp = new Date().toJSON();
    const day = timeStamp.substring(0, 10);

    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: `${day}/files`,
            public_id: `files-${timeStamp}-${file.originalname}`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      uploadedFiles.push({
        name: file.originalname,
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    console.log("Uploaded files:", uploadedFiles);
    return res.status(200).json({ files: uploadedFiles });
  } catch (err) {
    console.error("Error uploading files:", err);
    res.status(500).json({ error: "Failed to upload files" });
  }
});

module.exports = route;
