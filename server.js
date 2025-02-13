require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const Airtable = require("airtable");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Configure Multer for File Uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
});

// Airtable Configuration
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);
const tableName = process.env.AIRTABLE_TABLE_NAME;

// Location Abbreviation Table for Email Subject
const locationMap = {
  "MEXICO": "MEX",
  "CENTRAL AMERICA": "CENAM",
  "DOMINICAN REPUBLIC": "DOR",
  "COLOMBIA": "COL",
  "BRAZIL": "BRA",
  "PERU": "PER",
  "CHILE": "CHL",
  "OTHER": "OTH",
};

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route to Handle Form Submission
app.post("/submit", upload.array("attachments", 5), async (req, res) => {
  const {
    requesterName,
    requesterEmail, // Now included
    requestType,
    location,
    projectName,
    unitModel,
    issue,
    description,
    serialNumbers,
    troubleshooting,
    priority,
    updates,
    scopeOfTraining,
    expectedDate,
    numTrainees,
    relatedIssues,
    rootCause,
  } = req.body;

  try {
    // Convert location to abbreviation for email subject
    const locationAbbrev = locationMap[location] || location;

    // Prepare the data for Airtable
    let airtableData = {
      "Requested by": requesterName,
      "Requester Email": requesterEmail,
      "TYPE OF REQUEST": requestType,
      "Location": location,
      "PROJECT NAME": projectName || "",
      "TYPE OF PRODUCT": unitModel || "",
      "ISSUE": issue || "",
      "DESCRIPTION": description || "",
      "SERIAL NUMBERS": serialNumbers || "",
      "TROUBLESHOOTING STEPS COMPLETED": troubleshooting || "",
      "PRIORITY": priority || "",
      "UPDATES": updates || "",
      "SCOPE OF TRAINING - for TRAINING": scopeOfTraining || "",
      "EXPECTED DATE - for TRAINING": expectedDate || "",
      "NUMBER OF TRAINEES - for TRAINING": numTrainees || "",
      "RELATED ISSUES": relatedIssues || "",
      "Root Cause - For RCA requests": rootCause || "",
    };

    // Handle file attachments for Airtable
    if (req.files && req.files.length > 0) {
      airtableData["ATTACHMENTS"] = req.files.map(file => ({
        url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        filename: file.originalname
      }));
    }

    // Create the record in Airtable
    await base(tableName).create([{ fields: airtableData }]);

    // **Dynamically Build Email Body (Removing Empty Fields)**
    let emailBody = `A new ${requestType} request has been submitted by ${requesterName}.\n\n`;
    const fields = {
      "Location": location,
      "Project Name": projectName,
      "Type of Product": unitModel,
      "Issue": issue,
      "Description": description,
      "Serial Numbers": serialNumbers,
      "Troubleshooting Steps": troubleshooting,
      "Priority": priority,
      "Updates": updates,
      "Scope of Training": scopeOfTraining,
      "Expected Date": expectedDate,
      "Number of Trainees": numTrainees,
      "Related Issues": relatedIssues,
      "Root Cause (for RCA)": rootCause,
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value && value.trim() !== "") {
        emailBody += `- ${key}: ${value}\n`;
      }
    }

    // Prepare email content
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: "coe.latam@sungrowamericas.com",
      cc: requesterEmail, // CC the requester
      subject: `[${locationAbbrev}] [${projectName || "N/A"}] NEW ${requestType} REQUEST`,
      text: emailBody,
      attachments: req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer,
      })),
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Submission successful!" });
  } catch (error) {
    console.error("Error processing submission:", error);
    res.status(500).json({ error: "Failed to submit form" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
