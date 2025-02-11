require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const Airtable = require("airtable");
const multer = require("multer");
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

const tableMap = {
  "SUPPORT": process.env.AIRTABLE_SUPPORT_TABLE,
  "TRAINING": process.env.AIRTABLE_TRAINING_TABLE,
  "RCA": process.env.AIRTABLE_RCA_TABLE,
  "OTHERS": process.env.AIRTABLE_OTHERS_TABLE,
};

const projectName = req.body.projectName ? String(req.body.projectName) : "";

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all routes
app.use(limiter);

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        files: 5, // Maximum 5 files
        fileSize: 10 * 1024 * 1024, // 10MB per file
        fieldSize: 50 * 1024 * 1024 // For form fields
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
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Input validation
const validateInput = (body) => {
    const requiredFields = {
        all: ['name', 'request', 'location', 'unitType'],
        SUPPORT: ['projectName', 'issue', 'description'],
        TRAINING: ['projectName', 'products', 'trainingScope'],
        RCA: ['projectName', 'issue', 'description'],
        OTHERS: ['description']
    };

    // Check common required fields
    const missingCommonFields = requiredFields.all.filter(field => !body[field]);
    if (missingCommonFields.length > 0) {
        throw new Error(`Missing required fields: ${missingCommonFields.join(', ')}`);
    }

    // Check request-type specific fields
    const requestType = body.request;
    if (requiredFields[requestType]) {
        const missingSpecificFields = requiredFields[requestType].filter(field => !body[field]);
        if (missingSpecificFields.length > 0) {
            throw new Error(`Missing required fields for ${requestType}: ${missingSpecificFields.join(', ')}`);
        }
    }

    // Validate field lengths
    if (body.issue && body.issue.length > 50) {
        throw new Error('Issue description exceeds 50 characters');
    }
    if (body.description && body.description.length > 500) {
        throw new Error('Description exceeds 500 characters');
    }
};

// Sanitize input
const sanitizeInput = (data) => {
    const sanitized = {};
    for (let key in data) {
        if (typeof data[key] === 'string') {
            sanitized[key] = data[key]
                .trim()
                .replace(/[<>]/g, '') // Remove potential HTML tags
                .slice(0, 1000); // Limit length
        } else {
            sanitized[key] = data[key];
        }
    }
    return sanitized;
};

// Create Airtable record
const createAirtableRecord = async (data, filesCount) => {
    const fields = {
        "Name": data.name,
        "Type of Request": data.request,
        "Location": data.location,
        "Project Name": projectName || "N/A", // Ensures a valid value is sent
        "Unit Type": data.unitType,
        "Issue": data.issue || '',
        "Description": data.description,
        "Serial Numbers": data.serialNumbers || '',
        "Troubleshooting": data.troubleshooting || '',
        "Products": data.products || '',
        "Training Scope": data.trainingScope || '',
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

    const emailSubject = `[${locationMap[data.location] || data.location}]_[${data.projectName || 'NO_PROJECT'}]_NEW ${data.request} REQUEST`;

    // Create HTML table rows for all relevant fields
    const createTableRows = (data) => {
        const relevantFields = {
            'Request Type': data.request,
            'Name': data.name,
            'Location': data.location,
            'Project Name': data.projectName,
            'Unit Type': data.unitType,
            'Issue': data.issue,
            'Description': data.description,
            'Serial Numbers': data.serialNumbers,
            'Troubleshooting Steps': data.troubleshooting,
            'Products': data.products,
            'Training Scope': data.trainingScope
        };

        return Object.entries(relevantFields)
            .filter(([_, value]) => value) // Only include fields with values
            .map(([key, value]) => `
                <tr>
                    <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">${key}</td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${value}</td>
                </tr>
            `).join('');
    };

    return {
        from: process.env.EMAIL_USER,
        to: process.env.SUPPORT_EMAIL || "coe.latam@sungrowamericas.com",
        subject: emailSubject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                <h2 style="color: #007bff;">New ${data.request} Request (ID: ${recordId})</h2>
                <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                    <tr style="background-color: #f8f9fa;">
                        <th style="text-align: left; padding: 12px; border: 1px solid #dee2e6;">Field</th>
                        <th style="text-align: left; padding: 12px; border: 1px solid #dee2e6;">Details</th>
                    </tr>
                    ${createTableRows(data)}
                </table>
                <p><strong>Attachments:</strong> ${filesCount} files</p>
                <p style="margin-top: 20px;">
                    <a href="mailto:${process.env.SUPPORT_EMAIL}" 
                       style="background-color: #007bff; color: white; padding: 10px 20px; 
                              text-decoration: none; border-radius: 5px;">
                        Reply to this request
                    </a>
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
            // Sanitize and validate input
            const sanitizedData = sanitizeInput(req.body);
            validateInput(sanitizedData);

            // Calculate total file size
            const totalSize = (req.files || []).reduce((sum, file) => sum + file.size, 0);
            if (totalSize > 50 * 1024 * 1024) {
                throw new Error('Total file size exceeds 50MB limit');
            }

            // Create Airtable record
            const recordId = await createAirtableRecord(sanitizedData, req.files?.length || 0);

            // Prepare and send email
            const mailOptions = createEmailContent(sanitizedData, recordId, req.files?.length || 0);

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
    res.status(200).json({ 
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Optional: Implement notification system for critical errors
});