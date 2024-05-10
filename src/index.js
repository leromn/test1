require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

var testRoutes = require("./routes");
const Job = require("./models/job");
const MONGODB_URI =
  "mongodb+srv://esraelasefa822:akZfVCD0snZnlBlZ@dil.uqd3gbq.mongodb.net/";

const app = express();
const port = process.env.PORT || 3002;

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    dbName: "DIL",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get("/testJson", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ message: "Get test success" });
});
app.post("/testJson", async (req, res) => {
  res.status(200).json({ message: req.body.test });
});
// Create clients and drivers
app.post("/clients", async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/drivers", async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all clients and drivers
app.get("/clients", async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/drivers", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Shipment request (client perspective)
app.post("/jobs", async (req, res) => {
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
  } = req.query;
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
app.get("/jobs", async (req, res) => {
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
app.put("/shipments/:id/assign", async (req, res) => {
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
app.put("/shipments/:id/complete", async (req, res) => {
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

app.use("/", testRoutes);
app.listen(port, () => console.log(`Server listening on port ${port}`));
