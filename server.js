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

// CORS and body parsing configuration
app.use(cors({
    origin: '*',
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
        cb(null, allowedTypes.includes(file.mimetype));
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
const Validators = {
    requestType: (type) => ['SUPPORT', 'RCA', 'TRAINING', 'OTHER'].includes(type),
    location: (location) => ['MEXICO', 'CENTRAL AMERICA', 'COLOMBIA', 'DOMINICAN REPUBLIC', 'BRAZIL', 'CHILE', 'OTHER'].includes(location),
    productType: (type) => ['STRING', 'CENTRAL', 'MVS', 'PVS', 'STORAGE', 'COMMUNICATION'].includes(type)
};

// Location abbreviation mapping
const LOCATION_MAP = {
    'MEXICO': 'MEX',
    'CENTRAL AMERICA': 'CENAM',
    'DOMINICAN REPUBLIC': 'DOR',
    'COLOMBIA': 'COL',
    'BRAZIL': 'BRA',
    'CHILE': 'CHL',
    'OTHER': 'OTH'
};

// Process file attachments
const processFile = async (file) => ({
    filename: file.originalname,
    type: file.mimetype,
    url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
});

// Main form submission endpoint
app.post('/submit', upload.array('attachments', 5), async (req, res) => {
    try {
        const { 
            requesterName, 
            requesterEmail, 
            request, 
            location, 
            projectName, 
            productType,
            model,
            gspTicket,
            serialNumbers,
            troubleshooting,
            trainingScope,
            expectedDate,
            traineesNumber
        } = req.body;

        // Comprehensive validation
        if (!requesterName || !requesterEmail || !request) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!Validators.requestType(request)) {
            return res.status(400).json({ error: `Invalid request type: ${request}` });
        }

        if (!Validators.location(location)) {
            return res.status(400).json({ error: `Invalid location: ${location}` });
        }

        if (!Validators.productType(productType)) {
            return res.status(400).json({ error: `Invalid product type: ${productType}` });
        }

        // Training-specific validation
        if (request === 'TRAINING' && (!trainingScope || !expectedDate || !traineesNumber)) {
            return res.status(400).json({ error: 'Missing required training fields' });
        }

        // Prepare Airtable record
        const fields = {
            'Requested by': requesterName,
            'Requester email': requesterEmail,
            'TYPE OF REQUEST': request,
            'Location': location,
            'PROJECT NAME': projectName,
            'TYPE OF PRODUCT': productType,
            'MODEL': model || '',
            'SERIAL NUMBERS': serialNumbers || '',
            'TROUBLESHOOTING STEPS COMPLETED': troubleshooting || '',
            'STATUS': 'NEW',
            'PRIORITY': '3- MEDIUM',
            'GSP TICKET': gspTicket || ''
        };

        // Add training-specific fields
        if (request === 'TRAINING') {
            fields['SCOPE OF TRAINING - for TRAINING'] = trainingScope;
            fields['EXPECTED DATE - for TRAINING'] = expectedDate;
            fields['NUMBER OF TRAINEES - for TRAINING'] = parseFloat(traineesNumber).toFixed(1);
        }

        // Process attachments
        if (req.files?.length > 0) {
            const attachments = await Promise.all(req.files.map(processFile));
            fields['ATTACHMENTS'] = attachments;
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
Model: ${model || 'N/A'}
GSP Ticket: ${gspTicket || 'N/A'}

This is an automated message. Please do not reply to this email.`,
            attachments: req.files ? req.files.map(file => ({
                filename: file.originalname,
                content: file.buffer
            })) : []
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Success response
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment check:');
    requiredEnvVars.forEach(varName => {
        console.log(`- ${varName}:`, process.env[varName] ? 'Set' : 'Missing');
    });
});