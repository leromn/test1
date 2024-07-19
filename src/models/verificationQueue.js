const mongoose = require("mongoose");

const verificationQueueSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  fullname: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const VerificationQueue = mongoose.model(
  "VerificationQueue",
  verificationQueueSchema,
);

module.exports = VerificationQueue;
