const express = require("express");
const router = express.Router();
const VerificationQueue = require("../models/verificationQueue");
const Driver = require("../models/driver");

// GET /verification/requests
router.get("/verification/requests", async (req, res) => {
  try {
    // Retrieve all verification requests sorted by creation date
    const verificationRequests = await VerificationQueue.find()
      .sort({
        createdAt: "desc",
      })
      .limit(10);

    // Return the list of verification requests
    res.status(200).json(verificationRequests);
  } catch (error) {
    // Return error response
    res.status(500).json({
      error: "An error occurred while retrieving verification requests.",
    });
  }
});

// GET /verification/requests/:id
router.get("/verification/requests/:id", async (req, res) => {
  try {
    const driverId = req.params.id;
    // Fetch the corresponding job based on the user ID in the verification request
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        error: "Job not found for the selected verification request.",
      });
    }

    // Return the selected job to the admin
    res.status(200).json(driver);
  } catch (error) {
    // Return error response
    res
      .status(500)
      .json({ error: "An error occurred while fetching the job." });
  }
});

module.exports = router;
