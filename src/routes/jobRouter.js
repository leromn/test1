var express = require("express"),
  router = express.Router();
const mongoose = require("mongoose");
const Job = require("../models/job");

router.post("/", async (req, res) => {
  console.log("post /jobs endpoint accessed");
  const {
    ownerIdr,
    descriptionr,
    originr,
    destinationr,
    container_locationr,
    container_weightr,
    estimated_costr,
    advance_paymentr,
    rangeLEr,
    router,
    number_of_drivers_neededr,
  } = req.body;
  console.log("body variables", req.body);
  try {
    const job = new Job({
      ownerId: ownerIdr,
      description: descriptionr,
      origin: originr,
      destination: destinationr,
      container_location: container_locationr,
      container_weight: container_weightr,
      estimated_cost: estimated_costr,
      advance_payment: advance_paymentr,
      rangeLE: rangeLEr,
      route: router,
      status: "Open",
      number_of_drivers_needed: number_of_drivers_neededr,
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

router.get("/test", async (req, res) => {
  try {
    const job = new Job({
      ownerId: "ownerIdr",
      description: "descriptionr",
      origin: "originr",
      destination: "destinationr",
      container_location: "container_locationr",
      container_weight: 122,
      estimated_cost: 333,
      advance_payment: 555,
      rangeLE: "rangeLEr",
      route: "router",
      status: "Open",
      number_of_drivers_needed: 5,
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

module.exports = router;
