var express = require("express"),
  router = express.Router();
const mongoose = require("mongoose");
const Job = require("../models/job");

router.post("/", async (req, res) => {
  console.log("post /jobs endpoint accessed");
  const {
    ownerId,
    description,
    origin,
    destination,
    container_location,
    container_weight,
    estimated_cost,
    advance_payment,
    rangeLE,
    route,
    number_of_drivers_needed,
  } = req.body;
  try {
    // Find client for validation
    // const client = await Client.findById(clientId);

    // if (!client) {
    //   return res.status(400).json({ message: "Invalid client ID" });
    // }

    const job = new Job({
      ownerId,
      description,
      origin,
      destination,
      container_location,
      container_weight,
      estimated_cost,
      advance_payment,
      rangeLE,
      route,
      status: "pending",
      number_of_drivers_needed,
      assigned_drivers_list: [],
    });

    await job.save();

    // Send notification to available drivers (implementation needed)
    console.log(`job created: ${job._id}`);

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Shipments (client or driver perspective - needs authorization)
router.get("/", async (req, res) => {
  console.log("/get jobs endpoint accessed");

  // const { userId, role } = req.user; // Implement user authentication and store user data in req.user
  try {
    let filter = {};
    // if (role === "client") {
    //   filter = { client: userId };
    // } else if (role === "driver") {
    //   filter = { driver: null }; // Find unassigned shipments
    // } else {
    //   return res.status(403).json({ message: "Unauthorized access" });
    // }
    const jobs = await Job.find(filter);
    res.json({ jobs: "working api" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign driver to shipment (admin or client with permission)
router.post("/:id/assign", async (req, res) => {
  const { driverId } = req.body;
  const shipmentId = req.params.id;
  try {
    const shipment = await Shipment.findByIdAndUpdate(
      shipmentId,
      {
        driver: driverId,
        status: "assigned",
      },
      { new: true },
    ); // Return the updated document

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // Send notification to assigned driver (implementation needed)
    console.log(`Driver assigned to shipment ${shipmentId}`);

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark shipment as completed (driver perspective)
router.post("/:id/complete", async (req, res) => {
  const shipmentId = req.params.id;
  const { driverId } = req.user; // Implement user authentication
  try {
    const shipment = await Shipment.findByIdAndUpdate(
      shipmentId,
      {
        status: "completed",
      },
      { new: true },
    );

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    if (shipment.driver._id.toString() !== driverId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    console.log(`Shipment ${shipmentId} marked as completed`);

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
