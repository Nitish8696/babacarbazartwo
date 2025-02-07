const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
        name: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        carId: { 
          type: String, // Using a normal string ID instead of ObjectId
          
        },
        carTitle:{
          type: String,
        },
        status: { type: String, default: "Pending" }, // Add status field

        createdAt: {
          type: Date,
          default: Date.now,
        },

      });
      
      module.exports = mongoose.model('Inquiry', inquirySchema);