var express = require("express"),
  router = express.Router();
const mongoose = require("mongoose");
const Client = require("../models/clinet");
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
// Get all clients and drivers
router.get("/clients", async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create clients and drivers
router.post("/clients", async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/register", async (req, res) => {
  const { full_name, phone_number, gender, password } = req.body;

  if (!full_name || !password || !phone_number) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const hashedPassword = await hashPassword(password);

  try {
    newUser = new Client({
      full_name,
      phone_number,
      hashedPassword,
      gender,
      my_jobs_list: [],
    });

    await newUser.save();
    res.json({ message: "Account created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { phone_number, password, role } = req.body;

  if (!phone_number || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let collection;
    if (role === "client") {
      collection = Client;
    } else if (role === "driver") {
      collection = Driver;
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await collection.findOne({ username });
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

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/loginTest", async (req, res) => {
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

module.exports = router;
