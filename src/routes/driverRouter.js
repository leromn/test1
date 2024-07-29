var express = require("express"),
  router = express.Router();
const Driver = require("../models/driver");
const VerificationQueue = require("../models/verificationQueue");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CurrentAppVersion = process.env.VERSION;

const fs = require("fs");
const path = require("path");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
function convertBufferToImage(buffer, fileExtension, id, type) {
  const filename = `${type}.${id}.${fileExtension}`;
  const filePath = path.join(__dirname, "images", filename);

  fs.writeFileSync(filePath, buffer, { encoding: "base64" });

  console.log(`Image file "${filePath}" created successfully.`);
}

router.post("/register", async (req, res) => {
  try {
    // referral string takes the values "empty" or another string id
    const { full_name, phone_number, age, gender, password, referral_string } =
      req.body;

    if (!full_name || !password || !phone_number || !gender || !age) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedPassword = await hashPassword(password);

    newUser = new Driver({
      full_name: full_name,
      phone_number: phone_number,
      password: hashedPassword,
      gender: gender,
      age: age,
    });

    await newUser.save();
    if (referral_string != "empty") {
      const [ref_role, ref_id] = referral_string.split("-");
      await Driver.findByIdAndUpdate(ref_id, {
        $push: {
          shipment_drivers_list: {
            user_id: ref_id,
            user_role: ref_role,
          },
        },
      });
    }
    res.json({ message: "Driver Account created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    // if (!clientVersion==CurrentAppVersion) {
    //   return res.status(400).json({ message: "upgrade the app to the latest version" });
    // }

    if (!phone_number || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await Driver.findOne({ phone_number: phone_number }).select(
      "-back_driving_license_image -front_driving_license_image -profile_image",
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // Verify password using bcrypt
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token based on user role
    const payload = { userId: user._id, role: user.constructor.modelName };
    const secretKey = process.env.JWT_SECRET; // Replace with a strong secret key (environment variable)
    const token = jwt.sign(payload, secretKey);

    res.json({ message: "Driver Login successful", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/refresh-retrieve", async (req, res) => {
  try {
    const { driver_id } = req.body;

    const user = await Driver.findById(driver_id).select(
      "-back_driving_license_image -front_driving_license_image -profile_image",
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid Id" });
    }

    // Generate JWT token based on user role
    const payload = { userId: user._id, role: user.constructor.modelName };
    const secretKey = process.env.JWT_SECRET; // Replace with a strong secret key (environment variable)
    const token = jwt.sign(payload, secretKey);

    res.json({ message: "Driver session refreshed successfully", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/get-driver-profile", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Driver.findById(userId).select("profile_image _id");
    if (!user) {
      res.status(500).send("no user with this id");
      return;
    } else if (!user.profile_image.data) {
      res.status(400).send("no profile picture");
      return;
    }
    let bufferData, contentType;
    // Check if the image face is front or back
    bufferData = user.profile_image.data;
    contentType = user.profile_image.content_type;

    const fileExtension = contentType.split("/")[1];
    const imageNameType = "P_";
    convertBufferToImage(bufferData, fileExtension, userId, imageNameType);
    // Set the headers for the download prompt

    res.setHeader(
      "Content-disposition",
      "attachment; filename=${imageNameType}.${id}.${fileExtension}",
    );

    // Set the appropriate headers for the image response
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", "inline");

    // Stream the file to the response
    const imagePath = path.join(
      __dirname,
      "images",
      `${imageNameType}.${id}.${fileExtension}`,
    ); //change name of each downloaded image to the appropriate user and type of image
    res.sendFile(imagePath);

    // res.status(200).send(" Image download successfully");
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
    const userId = req.body.driverId;

    const imageData = {
      data: imageFsData,
      content_type: contentType,
    };

    // Update the user document with the image data
    await Driver.findByIdAndUpdate(userId, {
      profile_image: imageData,
    });

    res.status(200).send("Profile Image uploaded successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

router.get("/:id/driving-licence/:image_face", async (req, res) => {
  try {
    // const userId = "66531249728ee6aec8d95e24";
    const userId = req.params.id;
    const imageFace = req.params.image_face;
    const imageNameType = "";

    const user = await Driver.findById(userId);
    if (!user) {
      res.status(500).send("no user with this id");
      return;
    }
    let bufferData, contentType;
    // Check if the image face is front or back
    if (imageFace == "front") {
      bufferData = user.front_driving_license_image.data;
      contentType = user.front_driving_license_image.content_type;
      imageNameType = "FL_";
    } else if (imageFace == "back") {
      bufferData = user.back_driving_license_image.data;
      contentType = user.back_driving_license_image.content_type;
      imageNameType = "BL_";
    } else {
      // Invalid image face value
      res.status(400).send("Invalid image face value");
    }

    const fileExtension = contentType.split("/")[1];
    convertBufferToImage(bufferData, fileExtension, userId, imageNameType);
    // Set the headers for the download prompt

    res.setHeader(
      "Content-disposition",
      "attachment; filename=${imageNameType}.${id}.${fileExtension}",
    );

    res.setHeader("Content-type", contentType);
    res.setHeader("Content-Disposition", "inline");

    // Stream the file to the response
    const imagePath = path.join(
      __dirname,
      "images",
      `${imageNameType}.${id}.${fileExtension}`,
    ); //change name of each downloaded image to the appropriate user and type of image
    res.sendFile(imagePath);

    // res.status(200).send(" Image download successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

router.post("/driving-licence", upload.single("image"), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const imageFsData = fs.readFileSync(path);
    const contentType = req.file.mimetype;
    console.log("content type ", contentType);

    const userId = req.body.driverId;
    const imageFace = req.body.face;

    const imageData = {
      data: imageFsData,
      content_type: contentType,
    };

    // Update the user document with the image data
    if (imageFace == "front") {
      await Driver.findByIdAndUpdate(userId, {
        front_driving_license_image: imageData,
      });
    } else if (imageFace == "back") {
      await Driver.findByIdAndUpdate(userId, {
        back_driving_license_image: imageData,
      });
    } else {
      res.status(500).send("provide the image face");
    }

    res.status(200).send("liscence Image uploaded successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

router.post("/request_verification", async (req, res) => {
  try {
    // Extract user ID and username from the request body
    const { userId, fullname, role } = req.body;

    // Create a new document in the verification queue collection
    await VerificationQueue.create({
      userId,
      fullname,
      role,
    });

    // Return success response
    res
      .status(201)
      .json({ message: "Verification request added to the queue." });
  } catch (error) {
    // Return error response
    res.status(500).json({
      error: "An error occurred while processing the verification request.",
    });
  }
});

router.post("/add_payment_method", async (req, res) => {
  const { driverId, p_type, p_number } = req.body;

  try {
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      {
        $push: {
          payment_methods: {
            payment_type: p_type,
            payment_number: p_number,
          },
        },
      },
      { new: true }, // Return the updated document
    );
    res.status(200).send("payment method added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

module.exports = router;
