require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

var TestRoutes = require("./routes/testRouter");
var JobRouter = require("./routes/jobRouter");
var ClientRouter = require("./routes/clinetRouter");
var DriverRouter = require("./routes/driverRouter");
var AdminRouter = require("./routes/adminRouter");

const MONGODB_URI =
  "mongodb+srv://esraelasefa822:akZfVCD0snZnlBlZ@dil.uqd3gbq.mongodb.net/";

const app = express();
const port = process.env.PORT || 3004;
const AppVersion = process.env.VERSION;

// // Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    dbName: "DIL",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes/
app.get("/testJson", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ message: "Get test success" });
});
app.post("/testJson", async (req, res) => {
  res.status(200).json({ message: req.body.test });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

//routers
app.use("/", TestRoutes);
app.use("/job", JobRouter);
app.use("/client", ClientRouter);
app.use("/driver", DriverRouter);
app.use("/admin", AdminRouter);

app.listen(port, () => console.log(`Server listening on port ${port}`));
