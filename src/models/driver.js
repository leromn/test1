const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  front_license_number: {
    type: String,
    // required: true,
  },
  back_license_number: {
    type: String,
  },
  driving_license_Image: {
    type: Buffer,
  },
  lorry_type: {
    //single vs double
    type: String,
  },
  job_applications: [
    {
      job_id: {
        type: String,
      },
      application_status: {
        type: String,
      },
    },
  ],
  // Add fields for driver ratings, license details, etc. (optional)
});

module.exports = mongoose.model("Driver", DriverSchema);
