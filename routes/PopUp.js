const express = require("express");
const router = express.Router();
const PopupForm = require("../models/PopupForm");
const {verifyTokenAndAdmin} = require("./verifyToken")
const nodemailer = require("nodemailer");



// POST: Save form data
router.post("/submit-form", async (req, res) => {
  try {
    const {
      name,
      mobileNumber,
    } = req.body;
    

    // Create a new form entry
    const formEntry = new PopupForm({
      name,
      mobileNumber,  
    });

    // Save to database
    await formEntry.save();
   
    
    
    
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_PORT === "465", // true for SSL, false for TLS
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
    
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.ADMIN_EMAIL,
          subject: "New PopUp Page Enquiery",
          html: `<h2>New Inquiry Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Mobile Number:</strong> ${mobileNumber}</p>`,
        });

    res.status(201).json({ success: true, message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error saving form data:", error.message);
    res.status(500).json({ success: false, message: "Failed to submit the form." });
  }
});

router.get("/get-forms",verifyTokenAndAdmin, async (req, res) => {
  try {
    // Fetch all the form entries from the database
    const forms = await PopupForm.find();

    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    console.error("Error fetching form data:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve form data." });
  }
});

router.patch("/update-status/:id",verifyTokenAndAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ["Pending", "Contacted", "Resolved"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value." });
  }

  try {
    // Find the form and update the status
    const updatedForm = await PopupForm.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedForm) {
      return res.status(404).json({ success: false, message: "Form not found." });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully.",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.delete("/delete-form/:id",verifyTokenAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedForm = await PopupForm.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({ success: false, message: "Form not found." });
    }

    res.status(200).json({ success: true, message: "Form deleted successfully." });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
