var express = require("express"),
  router = express.Router();
const fs = require("fs");
const path = require("path");

function convertBufferToImage(buffer, name) {
  const fileExtension = "png"; // Extract the file extension from the MIME type
  const filename = `${name}.${fileExtension}`;
  const filePath = path.join(__dirname, "images", filename);
  fs.writeFileSync(filePath, buffer, { encoding: "base64" });

  console.log(`Image file "${filePath}" created successfully.`);
}

router.get("/download", (req, res) => {
  const filename = "image.png"; // Replace with the actual filename of the image
  const filePath1 = path.join(__dirname, "images", filename);

  const imageFsData = fs.readFileSync(filePath1);
  convertBufferToImage(imageFsData, "newImageName");

  const filePath2 = path.join(__dirname, "images", "newImageName.png");

  if (!fs.existsSync(filePath2)) {
    res.status(404).send("new created File not found.");
    return;
  }

  // Set the headers for the download prompt
  res.setHeader("Content-disposition", "attachment; filename=newimage.jpg");
  res.setHeader("Content-type", "image/jpeg");

  // Stream the file to the response
  const fileStream = fs.createReadStream(filePath2);
  fileStream.pipe(res);
});
module.exports = router;
