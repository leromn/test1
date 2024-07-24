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
  },
  password: {
    type: String,
    required: true,
  },
  ////////////////////////////////////////////////////////////////////////////////

  identity_verified: {
    type: Boolean,
    default: false,
  },
  verification_status: {
    // nameError,pictureError,both
    type: String,
    default: false,
  },
  vehicle_added: {
    type: Boolean,
    default: false,
  },
  ////////////////////////////////////////////////////////////////////////////////
  lorry_type: {
    //single vs double
    type: String,
  },
  front_license_number: {
    type: String,
    // required: true,
  },
  back_license_number: {
    type: String,
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
  profile_image: {
    data: {
      type: Buffer,
    },
    content_type: {
      type: String,
    },
  },
  ////////////////////////////////////////////////////////////////////////////////
  total_balance: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
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
      job_status: {
        ///acceptable values : enrolled,rejected,completed
        type: String,
      },
      payment_completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
  referrals: [
    {
      user_role: {
        type: String,
      },
      user_id: {
        type: String,
      },
    },
  ],
  feedback: [
    {
      user_id: {
        type: String,
      },
      user_name: {
        type: String,
      },
      comment: {
        ///acceptable values : enrolled,rejected,completed
        type: String,
      },
      rating: {
        type: Number,
        default: 0,
      },
    },
  ],
  // Add fields for driver ratings, license details, etc. (optional)
});

module.exports = mongoose.model("Driver", DriverSchema);
