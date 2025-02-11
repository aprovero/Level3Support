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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
});

// Airtable Configuration
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const tableMap = {
  "SUPPORT": "IssuesLATAM",
  "TRAINING": "TrainingRequests",
  "RCA": "RCARequests",
  "OTHERS": "OtherRequests",
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
// Updated Airtable field mappings in server.js
app.post("/submit", upload.array("attachments", 5), async (req, res) => {
  try {
    // Extract and sanitize form fields
    const name = (req.body.name || "N/A").toString().trim();
    const request = (req.body.request || "N/A").toString().trim();
    const location = (req.body.location || "N/A").toString().trim();
    const projectName = (req.body.projectName || "N/A").toString().trim();
    const unitType = (req.body.unitType || "N/A").toString().trim();
    const issue = (req.body.issue || "N/A").toString().trim();
    const description = (req.body.description || "N/A").toString().trim();
    const serialNumbers = (req.body.serialNumbers || "N/A").toString().trim();
    const troubleshooting = (req.body.troubleshooting || "N/A").toString().trim();
    const products = (req.body.products || "N/A").toString().trim();
    const trainingScope = (req.body.trainingScope || "N/A").toString().trim();

    // Determine Airtable table based on request type
    const tableName = tableMap[request] || "OtherRequests";

    // Base fields that are common across tables
    let airtableData = {
      "Name": name,
      "Location": location,
      "Type of Unit": unitType,
      "Created date": new Date().toISOString()
    };

    // Add fields based on request type with exact Airtable field names
    switch (request) {
      case "SUPPORT":
        airtableData = {
          ...airtableData,
          "Issue": issue,
          "Type of Request": request,
          "Project Name": projectName,
          "Description": description,
          "Serial Numbers": serialNumbers,
          "Troubleshooting Steps": troubleshooting
        };
        break;
      case "TRAINING":
        airtableData = {
          ...airtableData,
          "Type of Request": request,
          "Project Name / Third Party": projectName,
          "Products": products,
          "Scope of Training": trainingScope
        };
        break;
      case "RCA":
        airtableData = {
          ...airtableData,
          "Issue": issue,
          "Type of Request": request,
          "Project Name": projectName,
          "Description": description,
          "Serial Numbers": serialNumbers
        };
        break;
      case "OTHERS":
        airtableData = {
          ...airtableData,
          "Issue": issue,
          "Description of Request": description
        };
        break;
    }

    // Save to Airtable
    const record = await base(tableName).create([{ fields: airtableData }]);

    // Prepare email content
    let emailBody = `
      New ${request} Request Details:
      
      Requester: ${name}
      Location: ${location}
      Type of Unit: ${unitType}
      ${projectName !== "N/A" ? `Project Name: ${projectName}\n` : ""}
      ${issue !== "N/A" ? `Issue: ${issue}\n` : ""}
      ${description !== "N/A" ? `Description: ${description}\n` : ""}
      ${serialNumbers !== "N/A" ? `Serial Numbers: ${serialNumbers}\n` : ""}
      ${troubleshooting !== "N/A" ? `Troubleshooting Steps: ${troubleshooting}\n` : ""}
      ${products !== "N/A" ? `Products: ${products}\n` : ""}
      ${trainingScope !== "N/A" ? `Training Scope: ${trainingScope}\n` : ""}
    `;

    // Prepare email attachments
    let emailAttachments = [];
    if (req.files && req.files.length > 0) {
      emailAttachments = req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer,
      }));
    }

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "coe.latam@sungrowamericas.com",
      subject: `[${location}] [${projectName}] NEW ${request} REQUEST`,
      text: emailBody,
      attachments: emailAttachments,
    });

    res.status(200).json({ message: "Request submitted successfully!" });
  } catch (error) {
    console.error("Error processing submission:", error);
    res.status(500).json({ 
      error: "Failed to submit form", 
      details: error.message 
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
