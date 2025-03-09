const mongoose = require('mongoose');

// Define the schema
const carSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  Brand: {
    type: String,
    required: true,
    enum: ['maruti suzuki', 'mahindra', 'Nexa', 'Skoda', 'Nissan', 'Tata', 'Renault', 'volkswagen', 'MG', 'Hyundai', 'Toyota', 'Honda', 'Kia'], // Add all possible makes
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['Petrol', 'Diesel', 'Electric', 'Petrol + Hybrid', 'Petrol + CNG', 'LPG'], // Fixed values
  },
  transmissionType: {
    type: String,
    required: true,
    enum: ['Manual', 'Automatic'], // Fixed values
  },
  bodyType: {
    type: String,
    required: true,
    enum: ['Sedan', 'SUV', 'Hatchback', 'Convertible', 'Truck', 'Van', 'Coupe', 'Other'], // Fixed values
  },
  makeYear: {
    type: String,
    required: true,
    match: /^(\d{2}-\d{4})$/, // Format MM-YYYY
  },
  kilometersRun: {
    type: Number,
    required: true,
    min: 0, // No negative values
  },
  budget: {
    type: Number,
    required: true,
    min: 0, // Minimum price
  },
  ownerType: {
    type: String,
    required: true,
    enum: ['First Owner', 'Second Owner', 'Third Owner', 'More than Three Owners'], // Fixed values
  },
  insuranceType: {
    type: String,
    required: true,
    enum: ['Comprehensive', 'Third Party Only', 'None'], // Insurance types
  },
  insuranceValidTill: {
    type: Date,
    default: null, // Default value if no insurance validity is provided
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  secondKey: {
    type: String,
    required: true,
    enum: ['Yes', 'No'], // Whether the second key is available
  },
  rto: {
    type: String,
    required: true,
    match: /^[A-Za-z]{2}-\d{2}$/, // RTO format like "RJ-02"
  },
  description: {
    type: String,
    trim: true,
  },
  images: {
    type: [String], // Array of image URLs
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  emiStartFrom: {
    type: Number, // EMI should be a number
    // required: true,
    min: 0, // EMI cannot be negative
  },
  sold: {
    type: Boolean,
    default: false, // Defaults to not sold
  },
});

module.exports = mongoose.model('Car', carSchema);
