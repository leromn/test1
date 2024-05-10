const mongoose = require("mongoose");
const JobSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  container_location: {
    type: String,
    required: true,
  },
  container_weight: {
    type: Number,
    required: true,
  },
  estimated_cost: {
    type: Number,
    required: true,
  },
  advance_payment: {
    type: Number,
    required: true,
  },
  rangeLE: {
    //local vs export
    type: String,
    // required: true,
  },
  route: {
    type: String,
    // required: true,
  },
  status: {
    type: String,
    enum: ["Open", "Assigned", "Completed", "Cancelled"],
    default: "Open",
  },
  number_of_drivers_needed: {
    type: Number,
  },
  assigned_drivers_list: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job", JobSchema);
