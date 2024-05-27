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
    required: true,
  },
  my_jobs_list: [
    {
      job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
      job_title: {
        type: String,
        required: true,
      },
    },
  ],
  // Add fields for driver ratings, license details, etc. (optional)
});

module.exports = mongoose.model("Client", ClinetSchema);
