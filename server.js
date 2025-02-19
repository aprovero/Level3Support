require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const Airtable = require('airtable');

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

// CORS configuration
app.use(cors({
    origin: 'https://aprovero.github.io',
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Body parsing configuration
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB total limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'application/zip', 'application/x-rar-compressed'
        ];
        console.log('Uploaded file type:', file.mimetype);
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.log('Rejected file type:', file.mimetype);
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Airtable and email configuration
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const TABLE_NAME = 'CoE LATAM';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Validation utilities
const validOptions = {
    'TYPE OF REQUEST': ['SUPPORT', 'RCA', 'TRAINING', 'OTHERS'],
    'Location': ['MEXICO', 'CENTRAL AMERICA', 'DOMINICAN REPUBLIC', 'COLOMBIA', 'BRAZIL', 'CHILE', 'OTHERS'],
    'TYPE OF PRODUCT': ['STRING', 'CENTRAL', 'MVS', 'PVS', 'STORAGE', 'COMMUNICATION']
};

// Location abbreviation mapping
const LOCATION_MAP = {
    'MEXICO': 'MEX',
    'CENTRAL AMERICA': 'CENAM',
    'DOMINICAN REPUBLIC': 'DOR',
    'COLOMBIA': 'COL',
    'BRAZIL': 'BRA',
    'CHILE': 'CHL',
    'OTHERS': 'OTH'
};

// Main form submission endpoint
app.post('/submit', upload.array('attachments', 5), async (req, res) => {
    try {
        console.log('Received form submission with data:', req.body);
        console.log('Received files:', req.files);

        const { 
            requesterName, 
            requesterEmail, 
            request, 
            location, 
            projectName, 
            productType,
            description,
            model,
            gspTicket,
            serialNumbers
        } = req.body;

        // Basic field validation
        if (!requesterName || !requesterEmail || !request || !location || !productType || !description || !projectName) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Please fill out all required fields.'
            });
        }

        // Email format validation
        if (!isValidEmail(requesterEmail)) {
            return res.status(400).json({
                error: 'Invalid email format',
                details: 'Please provide a valid email address.'
            });
        }

        // Validate request type
        if (!validOptions['TYPE OF REQUEST'].includes(request)) {
            return res.status(400).json({
                error: 'Invalid request type',
                details: 'Please select a valid request type.'
            });
        }

        // Validate location
        if (!validOptions['Location'].includes(location)) {
            return res.status(400).json({
                error: 'Invalid location',
                details: 'Please select a valid location.'
            });
        }

        // Validate product type
        if (!validOptions['TYPE OF PRODUCT'].includes(productType)) {
            return res.status(400).json({
                error: 'Invalid product type',
                details: 'Please select a valid product type.'
            });
        }

        // Prepare Airtable record
        const fields = {
            'Requested by': requesterName,
            'Requester email': requesterEmail,
            'TYPE OF REQUEST': request,
            'Location': location,
            'PROJECT NAME': projectName,
            'TYPE OF PRODUCT': productType,
            'Description': description,
            'STATUS': 'NEW',
            'PRIORITY': '4- LOW'
        };

        // Add Support/RCA specific fields if applicable
        if (['SUPPORT', 'RCA'].includes(request)) {
            if (model) fields['MODEL'] = model;
            if (gspTicket) fields['GSP TICKET'] = gspTicket;
            if (serialNumbers) fields['SERIAL NUMBERS'] = serialNumbers;
        }

        // Add attachments field if files are present
        if (req.files && req.files.length > 0) {
            fields['ATTACHMENTS'] = 'Attachments in email';
        }

        // Create Airtable record
        const record = await base(TABLE_NAME).create([{ fields }]);
        const issueId = record[0].fields['ISSUE ID'];

        // Prepare email
        const locationAbbrev = LOCATION_MAP[location] || 'OTH';
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'coe.latam@sungrowamericas.com',
            cc: requesterEmail,
            subject: `[${issueId}]_[${locationAbbrev}]_NEW ${request} REQUEST`,
            text: `A new ${request} request has been submitted:

Issue ID: ${issueId}
Requester: ${requesterName}
Email: ${requesterEmail}
Location: ${location}
Project Name: ${projectName}
Product Type: ${productType}
Description: ${description}
${model ? `Model: ${model}` : ''}
${gspTicket ? `GSP Ticket: ${gspTicket}` : ''}
${serialNumbers ? `Serial Numbers: ${serialNumbers}` : ''}

This is an automated message. Please do not reply to this email. For any questions or updates, please contact the CoE team directly.`,
            attachments: req.files ? req.files.map(file => ({
                filename: file.originalname,
                content: file.buffer,
                contentType: file.mimetype
            })) : []
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Log successful submission
        console.log('Request submitted successfully:', {
            issueId,
            requestType: request,
            location: locationAbbrev
        });

        // Success response
        res.status(200).json({
            message: 'Request submitted successfully',
            issueId: issueId
        });

    } catch (error) {
        console.error('Detailed server error:', error);
        console.error('Error stack:', error.stack);
        
        // Send appropriate error response
        res.status(500).json({
            error: 'Server error',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    if (error instanceof multer.MulterError) {
        console.error('Multer error details:', error);
        return res.status(400).json({
            error: 'File upload error',
            details: error.message,
            code: error.code
        });
    }
    
    res.status(500).json({
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Email validation utility
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment check:');
    requiredEnvVars.forEach(varName => {
        console.log(`- ${varName}:`, process.env[varName] ? 'Set' : 'Missing');
    });
});