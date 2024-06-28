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
  profile_image: {
    data: {
      type: Buffer,
    },
    content_type: {
      type: String,
    },
  },
  front_driving_license_image: {
    data: {
      type: Buffer,
    },
    content_type: {
      type: String,
    },
  },
  back_driving_license_image: {
    data: {
      type: Buffer,
    },
    content_type: {
      type: String,
    },
  },
  lorry_type: {
    //single vs double
    type: String,
  },
  payment_methods: [
    {
      payment_type: {
        type: String,
      },
      payment_number: {
        type: String,
      },
    },
  ],
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
