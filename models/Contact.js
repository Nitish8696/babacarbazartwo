// models/Contact.js
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // email: {
  //   type: String,
  //   required: true,
  // },
  mobileNumber: {
    type: String,
    required: true,
  },
  // subject: {
  //   type: String,
  // },
  // message: {
  //   type: String,
  //   required: true,
  // },
  status: { type: String, default: "Pending" }, // Add status field

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contact", contactSchema);
