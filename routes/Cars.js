const express = require("express");
const mongoose = require("mongoose");
const Car = require("../models/Car");
const router = express.Router();
const path = require("path");
const uploadOnCloudinary = require("../utils/cloudinery");
const Inquiry = require("../models/Inquiry"); // Adjust the path to your Inquiry model
const cloudinary = require('cloudinary').v2; // Import cloudinary properly
const fs = require("fs")



// POST API to Add a Car

const multer = require("multer");
const { error } = require("console");


// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public"); // Destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

router.post("/add-cars", upload.array("images"), async (req, res) => {
  console.log("hello 2")
  console.log(req.files)
  console.log(req.body)
  let images = [];

  // Map through files and upload each one to Cloudinary
  const uploadPromises = req.files.map(async (file) => {
    const response = await uploadOnCloudinary(file.path);
    console.log(response)
    return response.secure_url;
  });

  // Wait for all uploads to complete
  images = await Promise.all(uploadPromises);
  console.log(images)
  try {
    const car = new Car({
      title: req.body.title,
      Brand: req.body.brand,
      model: req.body.model,
      fuelType: req.body.fuelType,
      transmissionType: req.body.transmissionType,
      bodyType: req.body.bodyType,
      makeYear: req.body.makeYear, // Convert to Date
      kilometersRun: parseInt(req.body.kilometersRun, 10), // Convert to number
      budget: parseInt(req.body.budget, 10), // Convert to number
      ownerType: req.body.ownerType,
      insuranceType: req.body.insuranceType,
      insuranceValidTill: req.body.insuranceValidTill, // Convert to Date
      color: req.body.color,
      secondKey: req.body.secondKey,
      rto: req.body.rto,
      description: req.body.description,
      images: images, // Images handled separately
      emiStartFrom: parseInt(req.body.emiStartFrom, 10), // Convert to number
    });
    
    ;

    const savedCar = await car.save();

    res.status(201).json({
      success: true,
      message: "Car added successfully!",
      data: savedCar,
    });
  } catch (error) {
    console.log(error.message);

    res.status(400).json({
      success: false,
      message: "Failed to add car!",
      error: error.message,

    });
  }
});

router.get("/latest-cars", async (req, res) => {
  try {
    console.log("Fetching latest cars...");

    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default limit of 10 cars
    const skip = (page - 1) * limit;

    // Count total cars that match the condition
    const totalCars = await Car.countDocuments({ sold: false });

    // Fetch latest unsold cars with pagination
    const latestCars = await Car.find({ sold: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Latest cars fetched successfully!",
      data: latestCars,
      pagination: {
        totalCars,
        totalPages: Math.ceil(totalCars / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error fetching latest cars:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest cars!",
      error: error.message,
    });
  }
});





// PUT API to Edit a Car by ID
router.put("/edit-cars/:id", upload.array("images"), async (req, res) => {
  const { id } = req.params;

  try {
    // Parse request data
    const { remainingImages, ...carData } = req.body;
    const parsedRemainingImages = remainingImages ? JSON.parse(remainingImages) : [];
    const newFiles = req.files; // New images uploaded

    console.log("carData:", carData);
    console.log("parsedRemainingImages:", parsedRemainingImages);
    console.log("newFiles:", newFiles);

    // Filter out invalid blob URLs
    const validRemainingImages = parsedRemainingImages.filter((url) => !url.startsWith("blob:"));

    // Upload new images to Cloudinary
    const uploadedImages = [];
    for (const file of newFiles) {
      const result = await cloudinary.uploader.upload(file.path);
      uploadedImages.push(result.secure_url);
      fs.unlinkSync(file.path); // Delete temporary file after upload
    }

    // Combine and deduplicate images
    const combinedImages = [...new Set([...validRemainingImages, ...uploadedImages])];

    // Find the car by ID
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found!",
      });
    }

    // Update car images and other fields
    car.images = combinedImages;
    Object.assign(car, carData);

    // Save updated car data
    await car.save();

    res.status(200).json({
      success: true,
      message: "Car updated successfully!",
      data: car,
    });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(400).json({
      success: false,
      message: "Failed to update car!",
      error: error.message,
    });
  }
});








router.post("/delete-car-images/:id", async (req, res) => {
  const { id } = req.params;
  const { imagesToDelete } = req.body;
  console.log(imagesToDelete);
  

  try {
    if (!imagesToDelete || !Array.isArray(imagesToDelete)) {
      return res.status(400).json({
        success: false,
        message: "Invalid imagesToDelete format. Must be an array of public IDs.",
      });
    }

    for (const publicId of imagesToDelete) {
      await cloudinary.uploader.destroy(publicId);
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found!" });
    }

    car.images = car.images.filter(
      (image) => !imagesToDelete.includes(image.publicId)
    );
    await car.save();

    res.status(200).json({
      success: true,
      message: "Images deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete images!",
      error: error.message,
    });
  }
});

// GET API to Fetch All Cars
router.get("/all-cars", async (req, res) => {
  try {
    let { page, limit } = req.query;

    // Convert page and limit to numbers with default values
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // Calculate the number of items to skip
    const skip = (page - 1) * limit;

    // Fetch cars with pagination
    const cars = await Car.find().skip(skip).limit(limit);

    // Get total count of cars
    const totalCars = await Car.countDocuments();

    res.status(200).json({
      success: true,
      message: "Cars fetched successfully!",
      data: cars,
      pagination: {
        totalCars,
        currentPage: page,
        totalPages: Math.ceil(totalCars / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cars!",
      error: error.message,
    });
  }
});


// GET API to Fetch a Car by ID
router.get("/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find car by ID
    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Car fetched successfully!",
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch car!",
      error: error.message,
    });
  }
});

// DELETE API to Delete a Car by ID
router.delete("/delete-cars/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the car by ID
    const deletedCar = await Car.findByIdAndDelete(id);

    if (!deletedCar) {
      return res.status(404).json({
        success: false,
        message: "Car not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Car deleted successfully!",
      data: deletedCar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete car!",
      error: error.message,
    });
  }
});
router.get('/filter-cars', async (req, res) => {
  try {
    const { 
      minBudget, 
      maxBudget, 
      Brand, 
      premium, 
      bodyType, 
      fuelType, 
      ownerType 
    } = req.query;

    console.log(req.query);

    let query = {};

    // Budget filter
    if (minBudget && maxBudget) {
      query.budget = { $gte: parseInt(minBudget), $lte: parseInt(maxBudget) };
    }

    // Brand filter
    if (Brand) {
      query.Brand = Brand;
    }

    // Premium filter
    if (premium) {
      query.premium = premium === 'true'; // Convert to boolean
    }

    // Body type filter
    if (bodyType) {
      query.bodyType = bodyType;
    }

    // Fuel type filter
    if (fuelType) {
      query.fuelType = fuelType;
    }

    // Owner type filter
    if (ownerType) {
      query.ownerType = ownerType;
    }

    // Fetch cars based on the query, or all cars if no filters are provided
    const cars = await Car.find(query);
    res.json({ success: true, data: cars });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post('/car-inquiry', async (req, res) => {
  const { name, mobileNumber,carId,carTitle } = req.body;

  // Basic validation
  if (!name || !mobileNumber || !carId) {
    return res.status(400).json({ error: 'Name and mobile number are required.' });
  }

  try {
    // Save the inquiry to the database
    const newInquiry = new Inquiry({ name, mobileNumber,carId,carTitle});
    await newInquiry.save();

    res.status(201).json({ message: 'Inquiry received successfully.', Inquiry: newInquiry });
  } catch (error) {
    console.error('Error saving inquiry:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.delete("/car-inquiry/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Inquiry.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Inquiry deleted successfully." });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

router.patch('/car-inquiry/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required.',
    });
  }

  try {
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Returns the updated document
    );

    if (!updatedInquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry status updated successfully.',
      data: updatedInquiry,
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});


router.get("/car-inquiries", async (req, res) => {
  try {
    // Fetch inquiries from the database
    const inquiries = await Inquiry.find();

    if (!inquiries || inquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No inquiries found.",
      });
    }

    res.status(200).json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error("Error fetching car inquiries:", error.message);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while fetching car inquiries. Please try again later.",
    });
  }
});

router.get("/search-cars", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search query!",
      });
    }

    // Perform case-insensitive search for suggestions (e.g., matching start of title, model, etc.)
    const cars = await Car.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { Brand: { $regex: query, $options: "i" } },
        { model: { $regex: query, $options: "i" } },
      ],
    }).limit(5);  // Limit to 5 results for suggestions

    return res.status(200).json({
      success: true,
      data: cars,
    });
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch search suggestions.",
      error: error.message,
    });
  }
});








module.exports = router;
