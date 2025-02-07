// routes/contact.js
const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// POST route to save contact form data
router.post("/contact-form", async (req, res) => {
  try {
    const { name, email, mobileNumber, subject, message } = req.body;

    if (!name || !email || !mobileNumber || !message) {
      return res.status(400).json({ success: false, message: "All required fields must be filled." });
    }

    const newContact = new Contact({
      name,
      email,
      mobileNumber,
      subject,
      message,
    });

    await newContact.save();    
    res.status(201).json({ success: true, message: "Form submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error saving form data." });
  }
});

// GET route to fetch all contact form submissions
router.get("/all-contact", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching form data." });
  }
});

router.patch("/update-status/:id", async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
      
        try {
          // Find the contact message by ID and update its status
          const updatedContact = await Contact.findByIdAndUpdate(
            id,
            { status }, // Update the status field
            { new: true } // Return the updated document
          );
      
          if (!updatedContact) {
            return res.status(404).json({ success: false, message: "Contact not found." });
          }
      
          res.status(200).json({ success: true, data: updatedContact, message: "Status updated successfully." });
        } catch (error) {
          console.error(error);
          res.status(500).json({ success: false, message: "Failed to update status." });
        }
      });

      router.delete("/delete/:id", async (req, res) => {
        try {
          const contactId = req.params.id;
      
          // Check if the contact exists
          const contact = await Contact.findById(contactId);
          if (!contact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
          }
      
          // Delete the contact
          await Contact.findByIdAndDelete(contactId);
      
          res.status(200).json({ success: true, message: "Contact deleted successfully" });
        } catch (error) {
          console.error("Error deleting contact:", error);
          res.status(500).json({ success: false, message: "Server error. Failed to delete contact." });
        }
      });
      

module.exports = router;
