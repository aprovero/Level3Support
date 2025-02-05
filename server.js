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
app.use(bodyParser.json({ limit: "50mb" })); // Increase JSON size limit
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" })); // Increase URL-encoded data size

// Configure Multer for File Uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit
});

// Airtable Configuration
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);
const tableName = "IssuesLATAM"; // Airtable table name

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
    name, request, location, projectName, unitModel, issue,
    description, serialNumbers, troubleshooting
  } = req.body;

  try {
    // Mapping location names to abbreviations
    const locationMap = {
      "MEXICO": "MEX",
      "CENTRAL AMERICA": "CENAM",
      "DOMINICAN REPUBLIC": "DOR",
      "COLOMBIA": "COL",
      "BRAZIL": "BRA",
      "PERU": "PER",
      "CHILE": "CLP",
      "OTHERS": "OTH"
    };
    const locationAbbrev = locationMap[location] || location;

    // Save to Airtable (attachments are left empty until we add public URLs)
    await base(tableName).create([
      {
        fields: {
          "Name": name,
          "Type of Request": request,
          "Location": location,
          "Project Name": projectName,
          "Unit Model": unitModel,
          "Issue": issue,
          "Description": description,
          "Serial Numbers": serialNumbers,
          "Troubleshooting": troubleshooting,        
        },
      },
    ]);

    // Prepare email
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: "coe.latam@sungrowamericas.com",
      subject: `[${locationAbbrev}]_[${projectName}]_NEW ${request} REQUEST SUBMITTED`,
      text: `
        A new ${request} request has been submitted:
        - Location: ${location}
        - Project Name: ${projectName}
        - Unit Model: ${unitModel}
        - Issue: ${issue}
        - Description: ${description}
        - Serial Numbers: ${serialNumbers}
        - Troubleshooting: ${troubleshooting}
      `
    };

    // Add attachments if any exist
    if (req.files && req.files.length > 0) {
      mailOptions.attachments = req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer,
      }));
    }
    console.log('Files received:', req.files.map(file => file.originalname));
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
