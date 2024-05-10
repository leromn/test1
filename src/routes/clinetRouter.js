var express = require("express"),
  router = express.Router();
const mongoose = require("mongoose");
const Client = require("../models/clinet");

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

module.exports = router;
