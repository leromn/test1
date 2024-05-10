var express = require("express"),
  router = express.Router();
const mongoose = require("mongoose");

async function searchByCriteria() {
  const MAX_DISTANCE_KM = 100; // Define your search radius in kilometers

  const searchCriteria = {
    "location.geo": {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [-93.24565, 44.85466], // Reference point
        },
        $maxDistance: MAX_DISTANCE_KM * 1000, // Convert km to meters
      },
    },
  };

  try {
    // Create a dynamic model based on the collection name
    const Model = mongoose.model("theaters", {});

    // Perform the search using the model
    const results = await Model.find(searchCriteria);

    // console.log(results);
    return results;
    // console.log(results);
  } catch (err) {
    console.error(err.message);
  }
}

router
  // Add a binding for '/tests/automated/'
  .get("/test", async function (req, res) {
    // var temp = await searchByCriteria().then((data) => {
    //   resp.json(JSON.stringify(data, null, ""));
    //   return data;
    // });
    res.setHeader("Content-Type", "application/json");
    console.log("Content-Type:", res.get("Content-Type"));

    res.send({ message: "workin json" });
    console.log("Automated Tests Running");
  });

module.exports = router;
