require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Airtable = require('airtable');
const multer = require('multer');

// Validate required environment variables
const requiredEnvVars = [
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID',
    'EMAIL_USER',
    'EMAIL_PASS'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
app.use(cors({
    origin: true,
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB total limit
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
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Airtable configuration
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const TABLE_NAME = 'CoE LATAM';

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Updated validation functions to match Airtable schema
const validateRequestType = (type) => {
    const validTypes = ['SUPPORT', 'RCA', 'TRAINING', 'OTHER'];
    const isValid = validTypes.includes(type);
    console.log('Request type validation:', type, isValid);
    return isValid;
};

const validateLocation = (location) => {
    const validLocations = ['MEXICO', 'CENTRAL AMERICA', 'COLOMBIA', 'DOMINICAN REPUBLIC', 'BRAZIL', 'CHILE', 'OTHER'];
    const isValid = validLocations.includes(location);
    console.log('Location validation:', location, isValid);
    return isValid;
};

const validateProductType = (type) => {
    const validTypes = ['STRING', 'CENTRAL', 'MVS', 'PVS', 'STORAGE', 'COMMUNICATION'];
    const isValid = validTypes.includes(type);
    console.log('Product type validation:', type, isValid);
    return isValid;
};

// Location abbreviation mapping
const locationMap = {
    'MEXICO': 'MEX',
    'CENTRAL AMERICA': 'CENAM',
    'DOMINICAN REPUBLIC': 'DOR',
    'COLOMBIA': 'COL',
    'BRAZIL': 'BRA',
    'CHILE': 'CHL',
    'OTHER': 'OTH'
};

// File processing helper
const processFile = async (file) => {
    const base64Content = file.buffer.toString('base64');
    return {
        filename: file.originalname,
        type: file.mimetype,
        url: `data:${file.mimetype};base64,${base64Content}`
    };
};

// Main submission route
app.post('/submit', upload.array('attachments', 5), async (req, res) => {
    try {
        console.log('Received form data:', req.body);
        
        // Validate required fields
        const requiredFields = ['requesterName', 'requesterEmail', 'request', 'location', 'projectName', 'productType'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate field values
        if (!validateRequestType(req.body.request)) {
            return res.status(400).json({ error: `Invalid request type: ${req.body.request}` });
        }
        if (!validateLocation(req.body.location)) {
            return res.status(400).json({ error: `Invalid location: ${req.body.location}` });
        }
        if (!validateProductType(req.body.productType)) {
            return res.status(400).json({ error: `Invalid product type: ${req.body.productType}` });
        }

        // Training-specific validations
        if (req.body.request === 'TRAINING') {
            if (!req.body.trainingScope) {
                return res.status(400).json({ error: 'Training scope is required for training requests' });
            }
            if (!req.body.expectedDate) {
                return res.status(400).json({ error: 'Expected date is required for training requests' });
            }
            if (!req.body.traineesNumber || isNaN(parseFloat(req.body.traineesNumber))) {
                return res.status(400).json({ error: 'Valid number of trainees is required for training requests' });
            }
        }

        // Prepare Airtable record
        const fields = {
            'Requested by': req.body.requesterName,
            'Requester email': req.body.requesterEmail,
            'TYPE OF REQUEST': req.body.request,
            'Location': req.body.location,
            'PROJECT NAME': req.body.projectName,
            'TYPE OF PRODUCT': req.body.productType,
            'MODEL': req.body.model || '',
            'SERIAL NUMBERS': req.body.serialNumbers || '',
            'TROUBLESHOOTING STEPS COMPLETED': req.body.troubleshooting || '',
            'STATUS': 'NEW',
            'PRIORITY': '3- MEDIUM',
            'GSP TICKET': req.body.gspTicket || '',
            'UPDATES': req.body.description || ''
        };

        // Add training-specific fields
        if (req.body.request === 'TRAINING') {
            fields['SCOPE OF TRAINING - for TRAINING'] = req.body.trainingScope;
            fields['EXPECTED DATE - for TRAINING'] = req.body.expectedDate;
            fields['NUMBER OF TRAINEES - for TRAINING'] = parseFloat(req.body.traineesNumber).toFixed(1);
        }

        // Process attachments
        if (req.files?.length > 0) {
            const attachments = await Promise.all(req.files.map(processFile));
            fields['ATTACHMENTS'] = attachments;
        }

        // Create record in Airtable
        const record = await base(TABLE_NAME).create([{ fields }]);
        const issueId = record[0].fields['ISSUE ID'];

        // Prepare and send email
        const locationAbbrev = locationMap[req.body.location] || 'OTH';
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'coe.latam@sungrowamericas.com',
            cc: req.body.requesterEmail,
            subject: `[${locationAbbrev}]_[${req.body.projectName}]_NEW ${req.body.request} REQUEST_${issueId}`,
            text: generateEmailBody(req.body, issueId),
            attachments: req.files ? req.files.map(file => ({
                filename: file.originalname,
                content: file.buffer
            })) : []
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: 'Request submitted successfully',
            issueId: issueId
        });

    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).json({
            error: 'Failed to submit request',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Email body generator
function generateEmailBody(data, issueId) {
  // Common information included in all emails
  let emailBody = `
A new ${data.request} request has been submitted:

Issue ID: ${issueId}
Requester: ${data.requesterName}
Email: ${data.requesterEmail}
Location: ${data.location}
Project Name: ${data.projectName}
Product Type: ${data.productType}
Model: ${data.model || 'N/A'}
GSP Ticket: ${data.gspTicket || 'N/A'}`;

  // Add support and RCA specific information if relevant
  if (['SUPPORT', 'RCA'].includes(data.request)) {
      emailBody += `
Serial Numbers: ${data.serialNumbers || 'N/A'}
Troubleshooting Steps: ${data.troubleshooting || 'N/A'}`;
  }

  // Add training-specific information if it's a training request
  if (data.request === 'TRAINING') {
      emailBody += `
Scope of Training: ${data.trainingScope}
Expected Date: ${data.expectedDate}
Number of Trainees: ${data.traineesNumber}`;
  }

  // Add description and attachments information
  emailBody += `
Description: ${data.description || 'N/A'}
Attachments: ${data.files?.length ? `${data.files.length} file(s) attached` : 'No attachments'}

This is an automated message. Please do not reply to this email.
For any questions or updates, please contact the CoE team directly.`;

  return emailBody;
}

// Export the function if using modules
module.exports = { generateEmailBody };

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  // Handle specific errors
  if (error.name === 'MulterError') {
      return res.status(400).json({
          error: 'File upload error',
          details: error.message
      });
  }
  
  // Handle general errors
  res.status(500).json({
      error: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment check:');
  console.log('- AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? 'Set' : 'Missing');
  console.log('- AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID ? 'Set' : 'Missing');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
});