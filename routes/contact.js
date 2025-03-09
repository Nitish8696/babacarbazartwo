const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");
const { verifyTokenAndAdmin } = require("./verifyToken");


router.post("/contact-form", async (req, res) => {
  try {
    const { name, email, mobileNumber, subject, message } = req.body;

    // 🔹 Validation
    if (!name || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Name and Mobile Number are required.",
      });
    }

    // 🔹 Save Inquiry in Database
    const newContact = new Contact({
      name,
      email: email || "N/A", // Default to "N/A" if email is not provided
      mobileNumber,
      subject: subject || "No Subject", // Default
      message: message || "No Message", // Default
    });

    const contact = await newContact.save();

    console.log(contact)

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
      subject: "New Contact Us Page Enquiery",
      html: `<h2>New Inquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Mobile Number:</strong> ${mobileNumber}</p>`,
    });
    res.status(201).json({ success: true, message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Error saving form data." });
  }
});

router.get("/all-contact", verifyTokenAndAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ success: false, message: "Error fetching form data." });
  }
});

router.patch("/update-status/:id", verifyTokenAndAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ success: false, message: "Contact not found." });
    }

    res.status(200).json({
      success: true,
      data: updatedContact,
      message: "Status updated successfully.",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, message: "Failed to update status." });
  }
});

router.delete("/delete/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const contactId = req.params.id;

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    await Contact.findByIdAndDelete(contactId);

    res.status(200).json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ success: false, message: "Server error. Failed to delete contact." });
  }
});

module.exports = router;
