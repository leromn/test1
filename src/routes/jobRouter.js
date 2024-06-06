var express = require("express"),
  router = express.Router();
const Job = require("../models/job");
const Driver = require("../models/driver");

const multer = require("multer");
const upload = multer({ dest: "../../uploads" });

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
router.post("/", upload.single("audio"), async (req, res) => {
  console.log("post /jobs endpoint accessed");
  const { originalname, path } = req.file;
  const audioData = fs.readFileSync(path);
  const contentType = req.file.mimetype;

  const {
    ownerId,
    text_description,
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
      text_description: text_description,
      audio_description: {
        data: audioData,
        content_type: contentType,
      },
      title: title,
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
      shipment_drivers_list: [],
    });

    await job.save();

    // Send notification to available drivers (implementation needed)
    console.log(`job created: ${job._id}`);
    // store the job id on the owner client database jobs
    const user = await Client.findOne({ _id: ownerId });
    user.my_jobs_list.push({ job_id: job._id, job_title: job.title });
    user.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Shipments (client or driver perspective - needs authorization)
router.get("/", async (req, res) => {
  console.log("/get jobs endpoint accessed");
  // sort values are
  // 1 Sort ascending.    -1 Sort descending.
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

//  driver Apply to shipment (admin or client with permission)
router.post("/:id/apply", async (req, res) => {
  const { driverId } = req.body;
  const jobId = req.params.id;
  try {
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        $push: {
          shipment_drivers_list: {
            driver: driverId,
            status: "assigned",
          },
        },
      },
      { new: true }, // Return the updated document
    );
    const driverUpdate = await Driver.findByIdAndUpdate(
      driverId,
      {
        $push: {
          job_applications: {
            driver: jobId,
            status: "assigned",
          },
        },
      },
      { new: true }, // Return the updated document
    );

    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    // Send notification to assigned driver (implementation needed)
    console.log(`Driver assigned to shipment ${jobId}`);

    res.json(job);
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
