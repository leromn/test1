var express = require("express"),
  router = express.Router();
const mongoose = require("mongoose");

router.post("/drivers", async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/drivers", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
