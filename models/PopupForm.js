const mongoose = require("mongoose");

const PopupForm = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    // email: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    // brand: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    status: { type: String, default: "Pending" }, // Add status field

  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("PopupForm", PopupForm);
