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
app.post("/submit", upload.array("attachments", 5), async (req, res) => {
  try {
    // Extract and sanitize form fields
    const name = req.body.name || "N/A";
    const request = req.body.request || "N/A";
    const location = req.body.location || "N/A";
    const projectName = req.body.projectName || "";
    const unitModel = req.body.unitModel || "";
    const issue = req.body.issue || "";
    const description = req.body.description || "";
    const serialNumbers = req.body.serialNumbers || "";
    const troubleshooting = req.body.troubleshooting || "";
    const products = req.body.products || "";
    const scope = req.body.scope || "";

    // Determine Airtable table based on request type
    const tableName = tableMap[request] || "OtherRequests";

    // Prepare Airtable data
    let airtableData = {
      "Name": name,
      "Type of Request": request,
      "Location": location,
      "Project Name": projectName,
      "Type of Unit": unitModel,
      "Issue": issue,
      "Description": description,
      "Serial Numbers": serialNumbers,
      "Troubleshooting": troubleshooting,
      "Products": products,
      "Scope": scope,
    };

    // Save to Airtable
    await base(tableName).create([{ fields: airtableData }]);

    // Prepare email content
    let emailBody = `
      A new ${request} request has been submitted by ${name}.

      - Location: ${location}
      - Project Name: ${projectName || "N/A"}
      - Type of Unit: ${unitModel || "N/A"}
      - Issue: ${issue || "N/A"}
      - Description: ${description || "N/A"}
      - Serial Numbers: ${serialNumbers || "N/A"}
      - Troubleshooting: ${troubleshooting || "N/A"}
      - Products: ${products || "N/A"}
      - Scope: ${scope || "N/A"}
    `;

    // Prepare email attachments
    let emailAttachments = [];
    if (req.files && req.files.length > 0) {
      emailAttachments = req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer,
      }));
    }

    // Prepare email options
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: "coe.latam@sungrowamericas.com",
      subject: `[${location}] [${projectName || "N/A"}] NEW ${request} REQUEST`,
      text: emailBody,
      attachments: emailAttachments,
    };

    // Send email
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
