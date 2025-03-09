const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const SliderImage = require("../models/Slider");
const {verifyTokenAndAdmin} = require("./verifyToken")


// Multer setup for temporary file storage
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

// POST: Upload images to Cloudinary and save to DB
router.post("/upload",verifyTokenAndAdmin, upload.array("images"), async (req, res) => {
        console.log(req.files)
  try {
    const imageUploads = await Promise.all(
        
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        fs.unlinkSync(file.path); // Remove temporary file
        return result.secure_url;
      })
    );
    

    const sliderImages = await SliderImage.insertMany(
      imageUploads.map((url) => ({ imageUrl: url }))
    );

    res.status(201).json({ success: true, data: sliderImages });
  } catch (error) {
    console.error("Error uploading images:", error.message);
    res.status(500).json({ success: false, message: "Image upload failed." });
  }
});

// GET: Fetch slider images (filtered by IDs or all)
router.get("/", async (req, res) => {
        try {
          const sliderImages = await SliderImage.find(); // Fetch all images from the database
          res.status(200).json({ success: true, data: sliderImages });
        } catch (error) {
          console.error("Error fetching slider images:", error.message);
          res.status(500).json({ success: false, message: "Failed to fetch images." });
        }
      });
      

// DELETE: Remove a slider image
router.delete("/:id",verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const image = await SliderImage.findById(id);
    if (!image) return res.status(404).json({ success: false, message: "Image not found." });

    const publicId = image.imageUrl.split("/").pop().split(".")[0]; // Extract Cloudinary public ID
    await cloudinary.uploader.destroy(publicId);
    await SliderImage.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Image deleted successfully." });
  } catch (error) {
    console.error("Error deleting image:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete image." });
  }
});

module.exports = router;
