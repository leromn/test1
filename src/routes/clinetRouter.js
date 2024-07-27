var express = require("express"),
  router = express.Router();
const Client = require("../models/clinet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (e) {
    console.log(e);
  }
};

//
router.post("/register", async (req, res) => {
  try {
    const { full_name, phone_number, gender, password, referral_string } =
      req.body;

    if (!full_name || !password || !phone_number || !gender) {
      return res.status(400).json({ message: "Missing required fields" });
    } else {
      console.log("Working");
    }

    const hashedPassword = await hashPassword(password);

    newUser = new Client({
      full_name: full_name,
      phone_number: phone_number,
      password: hashedPassword,
      gender: gender,
      my_jobs_list: [],
    });

    await newUser.save();
    if (
      referral_string != "empty" &&
      referral_string != "" &&
      referral_string != null
    ) {
      const [ref_role, ref_id] = referral_string.split("-");
      if (ref_role == "D") {
        await Driver.findByIdAndUpdate(ref_id, {
          $push: {
            referral: {
              user_id: ref_id,
              user_role: ref_role,
            },
          },
        });
      } else if (ref_role == "C") {
        await Client.findByIdAndUpdate(ref_id, {
          $push: {
            referral: {
              user_id: ref_id,
              user_role: ref_role,
            },
          },
        });
      }
    }
    res.json({ message: "Client Account created successfully", newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await Client.findOne({ phone_number: phone_number });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // Verify password using bcrypt
    // const validPassword = await bcrypt.compare(password, user.password);
    // if (!validPassword) {
    //   return res.status(401).json({ message: "Invalid username or password" });
    // }

    // Generate JWT token based on user role
    const payload = { userId: user._id, role: user.constructor.modelName };
    const secretKey = process.env.JWT_SECRET; // Replace with a strong secret key (environment variable)
    const token = jwt.sign(payload, secretKey);

    res.json({ message: "client Login successful", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/refresh-retrieve", async (req, res) => {
  try {
    const { client_id } = req.body;

    const client = await Client.findOne({ _id: client_id });
    if (!client) {
      return res.status(401).json({ message: "Invalid clientId" });
    }

    // Generate JWT token based on user role
    const payload = { userId: client._id, role: client.constructor.modelName };
    const secretKey = process.env.JWT_SECRET; // Replace with a strong secret key (environment variable)
    const token = jwt.sign(payload, secretKey);

    res.json({
      message: "Client session refreshed successfully",
      token,
      client,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/loginTest", async (req, res) => {
  try {
    // Generate JWT token based on user role
    const payload = { userId: "user._id", role: "user.constructor.modelName " };
    const secretKey = process.env.JWT_SECRET; // Replace with a strong secret key (environment variable)
    const token = jwt.sign(payload, secretKey);

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/add-feedback", async (req, res) => {
  const { clientId, clientName, driverId, comment, rating } = req.body;

  try {
    await Driver.findByIdAndUpdate(driverId, {
      $push: {
        feedback: {
          user_id: clientId,
          user_name: clientName,
          comment: comment,
          rating: rating,
        },
      },
    });
    res.status(200).send("comment added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});
module.exports = router;
