const mongoose = require("mongoose");
const JobSchema = new mongoose.Schema({
  ownerId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  text_description: {
    type: String,
    required: true,
  },
  audio_description: {
    data: {
      type: Buffer,
    },
    content_type: {
      type: String,
    },
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
  mode: {
    //uni vs multi modal
    type: String,
    // required: true,
  },
  container: {
    //with vs without container
    type: String,
    // required: true,
  },
  rangeLE: {
    //local vs export
    type: String,
    // required: true,
  },
  route: {
    // route 1 vs route 2
    type: String,
  },
  number_of_drivers_needed: {
    type: Number,
    required: true,
  },
  status: {
    // open,closed,completed
    type: String,
    default: "Open",
  },
  shipment_drivers_list: [
    {
      driver_id: {
        type: String,
      },
      driver_status: {
        type: String,
      },
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job", JobSchema);
