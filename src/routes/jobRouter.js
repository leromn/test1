var express = require("express"),
  router = express.Router();
const Job = require("../models/job");
const Driver = require("../models/driver");
const Client = require("../models/clinet");

const verifyToken = require("../middlware/tokenAuth").verifyToken;
const fs = require("fs");
const path = require("path");

const multer = require("multer");
const upload = multer({ dest: "../../uploads" });

const jwt = require("jsonwebtoken");
function convertBufferToAudio(buffer, fileExtension, id, imageNameType = "A_") {
  const filename = `${imageNameType}.${id}.${fileExtension}`;
  const filePath = path.join(__dirname, "audios", filename);

  fs.writeFileSync(filePath, buffer, { encoding: "base64" });

  console.log(`Audio file "${filePath}" created successfully.`);
}
//////////////////////////////////////////////////////////////////////////////////////////////////
const jobCache = []; // Array to hold the cached job elements

function addJobToCache(newJob) {
  jobCache.unshift(newJob); // Add the new array at the beginning

  if (jobCache.length > 10) {
    jobCache.pop(); // Remove the last (oldest) array if the length exceeds 10
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////

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
  let audio_description = {};
  try {
    if (req.file) {
      const { originalname, path } = req.file;
      const audioData = fs.readFileSync(path);
      const contentType = req.file.mimetype;
      // File is present in the request
      audio_description = {
        data: audioData,
        content_type: contentType,
      };
    } else {
      // File is not present in the request
      audio_description = {};
    }

    const {
      ownerId,
      title,
      text_description,
      origin,
      destination,
      container_location,
      container_weight,
      estimated_cost,
      advance_payment,
      rangeLE,
      route,
      mode,
      container,
      number_of_drivers_needed,
    } = req.body;
    // console.log("body variables", req.body);

    const job = new Job({
      ownerId: ownerId,
      title: title,
      text_description: text_description,
      audio_description: audio_description,
      origin: origin,
      destination: destination,
      container_location: container_location,
      container_weight: container_weight,
      estimated_cost: estimated_cost,
      advance_payment: advance_payment,
      mode: mode,
      container: container,
      rangeLE: rangeLE,
      route: route,
      status: "Open",
      number_of_drivers_needed: number_of_drivers_needed,
      shipment_drivers_list: [],
    });

    await job.save();
    const modifiedJob = { ...job, audio_description: undefined };
    addJobToCache(modifiedJob);
    // Send notification to available drivers (implementation needed)
    console.log(`job created: ${job._id}`);
    // store the job id on the owner client database jobs
    const user = await Client.findOne({ _id: ownerId });
    user.my_jobs_list.push({ job_id: job._id, job_title: job.title });
    user
      .save()
      .then(() => {
        console.log("Client job list updated successfully:");
      })
      .catch((error) => {
        console.error("Error updating client job list:", error);
      });

    res.status(200).json({ messsage: "job upload worked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get a specific shipment detail
router.get("/:id/get-job-detail", async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Driver.findById(jobId);
    if (!job) {
      res.status(400).send("job not found");
      return;
    }

    res.json(job).status(200).send(" job detail fetch successful");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

router.get("/:id/get-audio", async (req, res) => {
  try {
    const jobId = req.params.id;
    let bufferData, contentType, fileExtension;
    const filename = "A_".jobId;
    const folderPath = path.join(__dirname, "audios");
    fs.readdir(folderPath, async (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return;
      }

      const matchingFiles = files.filter((file) => {
        const fileExtension = path.extname(file).slice(1); // Get the file extension without the dot
        const fileNameWithoutExtension = path.basename(
          file,
          `.${fileExtension}`,
        );
        return fileNameWithoutExtension === filename;
      });

      ///////////////////////////////////////////////////////////////////////////////////////////////////////
      //if file not found on device

      if (matchingFiles.length === 0) {
        const job = await Job.findById(userId).select("audio_description _id");
        if (!job) {
          res.status(500).send("no job with this id");
          return;
        } else if (!job.audio_description.data) {
          res.status(400).send("no audio description");
          return;
        }
        // Check if the image face is front or back
        bufferData = user.audio_description.data;
        contentType = user.audio_description.content_type;

        fileExtension = contentType.split("/")[1];
        convertBufferToImage(bufferData, fileExtension, jobId, "A_");
      } else {
        const firstMatchingFile = matchingFiles[0];
        fileExtension = path.extname(firstMatchingFile).slice(1);
        contentType = mime.contentType(fileExtension);
        // const filePath = path.join(folderPath, firstMatchingFile);
        // bufferData = await fs.readFile(filePath);
      }
    });

    // Set the headers for the download prompt

    res.setHeader(
      "Content-disposition",
      "attachment; filename=${imageNameType}.${id}.${fileExtension}",
    );

    // Set the appropriate headers for the image response
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", "inline");

    // Stream the file to the response
    const audioPath = path.join(
      __dirname,
      "audios",
      `${imageNameType}.${jobId}.${fileExtension}`,
    ); //change name of each downloaded image to the appropriate user and type of image
    res.sendFile(audioPath);

    // res.status(200).send(" Image download successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

// Get all Shipments (client or driver perspective - needs authorization)
router.get("/all/:pageNumber", async (req, res) => {
  console.log("/get jobs endpoint accessed");
  // sort values are
  // 1 Sort ascending.    -1 Sort descending.
  var sortBy = req.query.sortBy;
  const pageNumber = parseInt(req.params.pageNumber);

  try {
    let filter = {};
    if (sortBy === "time" || !sortBy) {
      filter = { created_at: -1 };
    } else if (sortBy === "price") {
      filter = { estimated_cost: -1 };
    } else if (sortBy === "both") {
      filter = {
        created_at: -1,
        estimated_cost: -1,
      };
    }
    // https://dil-devserver.onrender.com/
    if (
      pageNumber === 1 &&
      jobCache.length > 0 &&
      (sortBy === "time" || !sortBy)
    ) {
      // Return the cached job elements for the first page
      res.json({ jobs: jobCache });
    } else {
      // Fetch the job list from the database
      const jobs = await Job.find({ status: "Open" })
        .select({ audio_description: 0 })
        .sort(filter)
        .skip((pageNumber - 1) * 10)
        .limit(10);

      if (pageNumber === 1 && (sortBy === "time" || !sortBy)) {
        // Update the cache with the job elements for the first page
        jobCache.length = 0; // Clear existing cache
        jobCache.push(...jobs); // Add new job elements to the cache
      }

      res.json({ jobs: jobs });
    }
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
    // driverUpdate.save();
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
router.post("/:id/close", async (req, res) => {
  const jobId = req.params.id;
  const { driverId } = req.body.driverId; // Implement user authentication
  try {
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        status: "closed",
      },
      { new: true },
    );

    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    if (job.ownerId._id.toString() !== driverId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    console.log(`Shipment ${jobId} marked as closed`);

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/:id/complete", async (req, res) => {
  const jobId = req.params.id;
  const { driverId } = req.body.driverId; // Implement user authentication
  try {
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        status: "completed",
      },
      { new: true },
    );

    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    if (job.ownerId._id.toString() !== driverId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    console.log(`Shipment ${jobId} marked as completed`);

    res.json(job);
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
