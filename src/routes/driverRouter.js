var express = require("express"),
  router = express.Router();
const Driver = require("../models/driver");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

router.post("/register", async (req, res) => {
  const { full_name, phone_number, age, gender, password } = req.body;

  if (!full_name || !password || !phone_number || !gender || !age) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const hashedPassword = await hashPassword(password);

  try {
    newUser = new Driver({
      full_name: full_name,
      phone_number: phone_number,
      password: hashedPassword,
      gender: gender,
      age: age,
    });

    await newUser.save();
    res.json({ message: "Driver Account created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { phone_number, password } = req.body;

  if (!phone_number || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await Driver.findOne({ phone_number: phone_number });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // Verify password using bcrypt
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token based on user role
    const payload = { userId: user._id, role: user.constructor.modelName };
    const secretKey = process.env.JWT_SECRET; // Replace with a strong secret key (environment variable)
    const token = jwt.sign(payload, secretKey);

    res.json({ message: "Driver Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/get-driver-profile", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Driver.findById(userId);
    if (!user) {
      res.status(400).send("user not found");
      return;
    }

    res.json(user).status(200).send(" person detail fetch successful");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

router.post("/:id/profile-image", upload.single("image"), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const imageFsData = fs.readFileSync(path);
    const contentType = req.file.mimetype;

    const userId = req.params.id;
    const imageData = {
      data: imageFsData,
      contentType: contentType,
    };

    // Update the user document with the image data
    await User.findByIdAndUpdate(userId, { profileImage: imageData });

    res.status(200).send("liscence Image uploaded successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

function convertBufferToImage(buffer, fileExtension, id) {
  const filename = `${id}.${fileExtension}`;
  const filePath = path.join(__dirname, "images", filename);

  fs.writeFileSync(filePath, buffer, { encoding: "base64" });

  console.log(`Image file "${filePath}" created successfully.`);
}

router.get("/:id/driving-licence", upload.single("image"), async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user && !user.profileImage) {
      return;
    }
    const { data, contentType } = user.profileImage;
    const fileExtension = contentType.split("/")[1];
    convertBufferToImage(data, fileExtension, userId);
    // Set the headers for the download prompt
    res.setHeader("Content-disposition", "attachment; filename=newimage.jpg");
    res.setHeader("Content-type", "image/jpeg");

    // Stream the file to the response
    const filePath = path.join(__dirname, "images", `${id}.${fileExtension}`); //change name of each downloaded image to the appropriate user and type of image
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    res.status(200).send(" Image download successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

router.post(
  "/:id/driving-licence",
  upload.single("image"),
  async (req, res) => {
    try {
      const { originalname, path } = req.file;
      const imageFsData = fs.readFileSync(path);
      const contentType = req.file.mimetype;

      const userId = req.params.id;
      const imageData = {
        data: imageFsData,
        contentType: contentType,
      };

      // Update the user document with the image data
      await User.findByIdAndUpdate(userId, {
        driving_license_Image: imageData,
      });

      res.status(200).send("liscence Image uploaded successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    }
  },
);

module.exports = router;
