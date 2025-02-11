```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const Airtable = require("airtable");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024 // 10MB per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
}).array('attachments', 5);

// Airtable configuration
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = "IssuesLATAM";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// Input validation
const validateInput = (body) => {
  const requiredFields = ['name', 'request', 'location', 'projectName', 'unitModel', 'issue', 'description'];
  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

// Create Airtable record
const createAirtableRecord = async (data, filesCount) => {
  const fields = {
    "Name": data.name,
    "Type of Request": data.request,
    "Location": data.location,
    "Project Name": data.projectName,
    "Unit Model": data.unitModel,
    "Issue": data.issue,
    "Description": data.description,
    "Serial Numbers": data.serialNumbers || '',
    "Troubleshooting": data.troubleshooting || '',
    "Status": "Open",
    "Priority": "Medium",
    "Files Present": filesCount > 0 ? "Yes" : "No",
    "Submission Date": new Date().toISOString()
  };

  try {
    const record = await base(tableName).create([{ fields }]);
    return record[0].getId();
  } catch (error) {
    console.error("Airtable Error:", error);
    throw new Error("Failed to create record in Airtable");
  }
};

// Create email content
const createEmailContent = (data, recordId, filesCount) => {
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

  return {
    from: process.env.EMAIL_USER,
    to: process.env.SUPPORT_EMAIL || "coe.latam@sungrowamericas.com",
    subject: `[${locationMap[data.location] || data.location}]_[${data.projectName}]_NEW ${data.request} REQUEST`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #007bff;">New ${data.request} Request (ID: ${recordId})</h2>
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <tr style="background-color: #f8f9fa;">
            <th style="width: 200px; text-align: left; padding: 12px; border: 1px solid #dee2e6;">Field</th>
            <th style="text-align: left; padding: 12px; border: 1px solid #dee2e6;">Details</th>
          </tr>
          ${Object.entries(data)
            .filter(([key]) => key !== 'attachments')
            .map(([key, value]) => `
              <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">${key.charAt(0).toUpperCase() + key.slice(1)}</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${value || 'N/A'}</td>
              </tr>
            `).join('')}
        </table>
        <p><strong>Attachments:</strong> ${filesCount} files</p>
        <p>
          <a href="mailto:coe.latam@sungrowamericas.com" style="color: #007bff;">Reply to this request</a>
        </p>
      </div>
    `
  };
};

// Main submission route
app.post("/submit", (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        error: err.code === 'LIMIT_FILE_SIZE' ? 
          'File size exceeds 10MB limit' : 
          'File upload error: ' + err.message 
      });
    }

    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      validateInput(req.body);
      
      // Calculate total file size
      const totalSize = (req.files || []).reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        throw new Error('Total file size exceeds 50MB limit');
      }

      // Create Airtable record
      const recordId = await createAirtableRecord(req.body, req.files?.length || 0);

      // Prepare email
      const mailOptions = createEmailContent(req.body, recordId, req.files?.length || 0);
      
      // Add attachments if present
      if (req.files?.length > 0) {
        mailOptions.attachments = req.files.map(file => ({
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype
        }));
      }

      // Send email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ 
        message: "Request submitted successfully",
        recordId
      });
      
    } catch (error) {
      console.error("Error processing submission:", error);
      res.status(500).json({ 
        error: error.message || "Failed to process request" 
      });
    }
  });
});

// Status check endpoint
app.get("/status/:recordId", async (req, res) => {
  try {
    const record = await base(tableName).find(req.params.recordId);
    res.json({
      status: record.fields.Status,
      priority: record.fields.Priority,
      assignedTo: record.fields["Assigned To"],
      lastUpdated: record.fields["Last Modified Time"]
    });
  } catch (error) {
    res.status(404).json({ error: "Record not found" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

```

Key improvements:
- Enhanced file validation
- Better error handling
- Formatted HTML emails
- Status check endpoint
- Health check endpoint
- Airtable integration improvements
- Process error handlers