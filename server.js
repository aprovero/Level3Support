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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure Multer for File Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Airtable Configuration
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);
const tableName = "IssuesLATAM"; // Update with your Airtable table name

// Nodemailer Configuration (Gmail Example)
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
    request, location, projectName, unitModel, issue,
    description, serialNumbers, troubleshooting
  } = req.body;

  try {
    // Format attachments for Airtable
    const airtableAttachments = req.files.map(file => ({
      url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      filename: file.originalname
    }));

    // Save to Airtable
    await base(tableName).create([
      {
        fields: {
          "Type of Request": request,
          "Location": location,
          "Project Name": projectName,
          "Unit Model": unitModel,
          "Issue": issue,
          "Description": description,
          "Serial Numbers": serialNumbers,
          "Troubleshooting": troubleshooting,
          "Attachments": airtableAttachments
        },
      },
    ]);
    // Mapping names to abbreviations for email subject
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

    // Convert location to abbreviation
    const locationAbbrev = locationMap[location] || location;

    // Prepare email
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: "coe.latam@sungrowamericas.com",
      subject: "[[${locationAbbrev}]_[${projectName}]_NEW REQUEST SUBMITED",
      text: `
        A new ${request} request has been submitted:
        - Location: ${location}
        - Project Name: ${projectName}
        - Unit Model: ${unitModel}
        - Issue: ${issue}
        - Description: ${description}
        - Serial Numbers: ${serialNumbers}
        - Troubleshooting: ${troubleshooting}
      `,
      attachments: req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer,
      }))
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
