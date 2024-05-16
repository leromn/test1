var express = require("express"),
  router = express.Router();
const mongoose = require("mongoose");
const Job = require("../models/job");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.userId = decoded.userId;
    // req.userRole = decoded.role;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
router.get("/jobsTokenTest", verifyToken, async (req, res) => {
  try {
    res.json({ message: "token authenticated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//upload jobs to the database
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
  console.log("body variables", req.body);
  try {
    const job = new Job({
      ownerId: ownerId,
      description: description,
      origin: origin,
      destination: destination,
      container_location: container_location,
      container_weight: container_weight,
      estimated_cost: estimated_cost,
      advance_payment: advance_payment,
      rangeLE: rangeLE,
      route: route,
      status: "Open",
      number_of_drivers_needed: number_of_drivers_needed,
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

  var sortBy = req.query.sortBy;
  try {
    let filter = {};
    if (sortBy === "time") {
      filter = { created_at: req.query.timeSort };
    } else if (sortBy === "price") {
      filter = { estimated_cost: req.query.priceSort };
    } else if (sortBy === "both") {
      filter = {
        created_at: req.query.timeSort,
        estimated_cost: req.query.priceSort,
      };
    }
    const jobs = await Job.find({}, filter);
    res.json({ jobs: jobs });
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
