const mongoose = require("mongoose");

const ClinetSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  referrals: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      user_role: {
        type: String,
        // required: true,
      },
      verification_status: {
        type: String,
      },
    },
  ],

  company: {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
  },
  paid_balance: {
    type: Number,
    default: 0,
  },
  my_jobs_list: [
    {
      job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
      job_title: {
        type: String,
        // required: true,
      },
      job_status: {
        ///acceptable values : in_progress,completed
        type: String,
      },
      payment_completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
  // Add fields for driver ratings, license details, etc. (optional)
});

module.exports = mongoose.model("Client", ClinetSchema);
