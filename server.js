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
const tableName = "Level3Support"; // Update with your Airtable table name

// Nodemailer Configuration (Gmail Example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route to Handle Form Submission
app.post("/submit", upload.single("attachments"), async (req, res) => {
  const {
    request, location, projectName, unitModel, issue,
    description, serialNumbers, troubleshooting
  } = req.body;

  const attachmentFile = req.file; // Uploaded file

  try {
    // Save to Airtable
    await base(tableName).create([
      {
        fields: {
          "Type of Request": request,
          Location: location,
          "Project Name": projectName,
          "Unit Model": unitModel,
          Issue: issue,
          Description: description,
          "Serial Numbers": serialNumbers,
          Troubleshooting: troubleshooting,
          Attachment: attachmentFile ? attachmentFile.originalname : "No File Uploaded"
        },
      },
    ]);

    // Send Email Notification
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: "coe.latam@sungrowamericas.com", // Change recipient
      subject: "New Level 3 Support Request",
      text: `
        A new support request has been submitted:

        - Type of Request: ${request}
        - Location: ${location}
        - Project Name: ${projectName}
        - Unit Model: ${unitModel}
        - Issue: ${issue}
        - Description: ${description}
        - Serial Numbers: ${serialNumbers}
        - Troubleshooting: ${troubleshooting}
      `,
    };

    // If there's an attachment, add it to the email
    if (attachmentFile) {
      mailOptions.attachments = [
        {
          filename: attachmentFile.originalname,
          content: attachmentFile.buffer,
        },
      ];
    }

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
