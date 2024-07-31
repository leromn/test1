const express = require("express");
const router = express.Router();
const VerificationQueue = require("../models/verificationQueue");
const Driver = require("../models/driver");

// GET /verification/requests
router.get("/verification/requests", async (req, res) => {
  try {
    const adminName = req.query.adminName;
    let verificationRequests = {};
    if (adminName == "first" || adminName == "") {
      verificationRequests = await VerificationQueue.find()
        .sort({
          createdAt: "desc",
        })
        .limit(10);
    } else if ((adminName = "second")) {
      verificationRequests = await VerificationQueue.find()
        .sort({
          createdAt: "desc",
        })
        .limit(10);
    } else if (adminName == "third") {
      verificationRequests = await VerificationQueue.find()
        .sort({
          createdAt: "desc",
        })
        .limit(20);
    }
    // Retrieve all verification requests sorted by creation date

    // Return the list of verification requests
    res.status(200).json(verificationRequests);
  } catch (error) {
    console.log(error);
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
    const projection = { front_driving_license_Image: 0, back_driving_license_image: 0, back_driving_license_Image: 0, front_driving_license_image: 0 };
    const driver = await Driver.findOne({ _id: driverId }, projection)
    if (!driver) {
      return res.status(404).json({
        error: "Job not found for the selected verification request.",
      });
    }

    // Return the selected job to the admin
    res.status(200).json(driver);
  } catch (error) {
    console.log(error)
    // Return error response
    res
      .status(500)
      .json({ error: "An error occurred while fetching the job." });
  }
});

router.post("/verification/verify/:id", async (req, res) => {
  try {
    const driverId = req.params.id;
    const { nameVerification, profilePictureVerification, driverVerified } =
      req.body;

    // Fetch the corresponding job based on the user ID in the verification request
    const projection = { front_driving_license_Image: 0, back_driving_license_image: 0, back_driving_license_Image: 0, front_driving_license_image: 0 };
    const driver = await Driver.findOne({ _id: driverId }, projection)


    if (!driver) {
      return res.status(404).json({
        error: "Job not found for the selected verification request.",
      });
    }

    // Check the name and profile picture verification status
    if (driverVerified == true) {
      // Update the driver_verified property
      driver.driver_verified = true;
    } else {
      driver.driver_verified = false;
      // nameError,pictureError,both
      if (nameVerification == false && profilePictureVerification == false) {
        driver.verification_status = "both";
      } else if (nameVerification == false) {
        driver.verification_status = "nameError";
      } else if (profilePictureVerification == false) {
        driver.verification_status = "pictureError";
      }
    }

    // Save the updated driver object
    await driver.save();
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
