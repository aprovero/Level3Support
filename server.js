require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const Airtable = require('airtable');

// Define and validate required environment variables
const requiredEnvVars = [
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID',
    'EMAIL_USER',
    'EMAIL_PASS'
];

// Check for missing environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS for cross-origin requests
app.use(cors({
    origin: '*', // In production, specify your actual domain
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Configure body parser for handling request data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
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

// Initialize Airtable connection
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const TABLE_NAME = 'CoE LATAM';

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Validation functions for form fields
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

// Location abbreviation mapping for email subjects
const locationMap = {
    'MEXICO': 'MEX',
    'CENTRAL AMERICA': 'CENAM',
    'DOMINICAN REPUBLIC': 'DOR',
    'COLOMBIA': 'COL',
    'BRAZIL': 'BRA',
    'CHILE': 'CHL',
    'OTHER': 'OTH'
};

// Helper function to process file attachments
const processFile = async (file) => {
    const base64Content = file.buffer.toString('base64');
    return {
        filename: file.originalname,
        type: file.mimetype,
        url: `data:${file.mimetype};base64,${base64Content}`
    };
};

// Main form submission endpoint
app.post('/submit', upload.array('attachments', 5), async (req, res) => {
    console.log('Received submission request');
    
    try {
        // Log received data for debugging
        console.log('Form data:', req.body);
        console.log('Files received:', req.files?.length || 0);

        // Validate required fields
        if (!req.body.requesterName || !req.body.requesterEmail || !req.body.request) {
            console.log('Missing required fields');
            return res.status(400).json({
                error: 'Missing required fields'
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
            if (!req.body.trainingScope || !req.body.expectedDate || !req.body.traineesNumber) {
                return res.status(400).json({ error: 'Missing required training fields' });
            }
        }

        // Prepare Airtable record fields
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
            console.log('Processing attachments...');
            const attachments = await Promise.all(req.files.map(processFile));
            fields['ATTACHMENTS'] = attachments;
        }

        // Create record in Airtable
        console.log('Creating Airtable record...');
        const record = await base(TABLE_NAME).create([{ fields }]);
        const issueId = record[0].fields['ISSUE ID'];
        console.log('Airtable record created:', issueId);

        // Prepare and send email
        const locationAbbrev = locationMap[req.body.location] || 'OTH';
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'coe.latam@sungrowamericas.com', // Hardcoded destination email
            cc: req.body.requesterEmail,
            subject: `[${issueId}]_[${locationAbbrev}]_NEW ${req.body.request} REQUEST`,
            text: `A new ${req.body.request} request has been submitted:

Issue ID: ${issueId}
Requester: ${req.body.requesterName}
Email: ${req.body.requesterEmail}
Location: ${req.body.location}
Project Name: ${req.body.projectName}
Product Type: ${req.body.productType}
Model: ${req.body.model || 'N/A'}
GSP Ticket: ${req.body.gspTicket || 'N/A'}

This is an automated message. Please do not reply to this email. For any questions or updates, please contact the CoE team directly.`,

            attachments: req.files ? req.files.map(file => ({
                filename: file.originalname,
                content: file.buffer
            })) : []
        };

        console.log('Sending email...');
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');

        // Send success response
        res.status(200).json({
            message: 'Request submitted successfully',
            issueId: issueId
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Server error',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    if (error.name === 'MulterError') {
        return res.status(400).json({
            error: 'File upload error',
            details: error.message
        });
    }
    
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