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
    'EMAIL_PASS',
    'DESTINATION_EMAIL'
];

// Check for missing environment variables
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
    origin: '*', // Specify actual domain in production
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB total limit
        files: 5 // Maximum 5 files
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

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Validation functions
const validations = {
    requestType: (type) => ['SUPPORT', 'TRAINING', 'RCA', 'OTHERS'].includes(type),
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    location: (location) => ['MEXICO', 'CENTRAL AMERICA', 'COLOMBIA', 'DOMINICAN REPUBLIC', 'BRAZIL', 'CHILE', 'OTHER'].includes(location),
    productType: (type) => ['STRING', 'CENTRAL', 'MVS', 'PVS', 'STORAGE', 'COMMUNICATION'].includes(type)
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

// Process file attachments
const processFile = async (file) => {
    const base64Content = file.buffer.toString('base64');
    return {
        filename: file.originalname,
        type: file.mimetype,
        url: `data:${file.mimetype};base64,${base64Content}`
    };
};

// Generate email content
function generateEmailContent(data, issueId) {
    let emailContent = `
        <h2>New Support Request</h2>
        <p><strong>Issue ID:</strong> ${issueId}</p>
        <p><strong>Requester Name:</strong> ${data.requesterName}</p>
        <p><strong>Requester Email:</strong> ${data.requesterEmail}</p>
        <p><strong>Request Type:</strong> ${data.request}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Project Name:</strong> ${data.projectName || 'Not specified'}</p>
        <p><strong>Product Type:</strong> ${data.productType}</p>
        <p><strong>Model:</strong> ${data.model || 'Not specified'}</p>
        <p><strong>GSP Ticket:</strong> ${data.gspTicket || 'Not specified'}</p>
    `;

    // Add request-specific information
    if (['SUPPORT', 'RCA', 'OTHERS'].includes(data.request)) {
        emailContent += `
            <p><strong>Serial Numbers:</strong> ${data.serialNumbers || 'Not provided'}</p>
            <p><strong>Troubleshooting Steps:</strong> ${data.troubleshooting || 'Not provided'}</p>
        `;
    } else if (data.request === 'TRAINING') {
        emailContent += `
            <p><strong>Training Scope:</strong> ${data.trainingScope || 'Not provided'}</p>
            <p><strong>Expected Date:</strong> ${data.expectedDate || 'Not specified'}</p>
            <p><strong>Number of Trainees:</strong> ${data.traineesNumber || 'Not specified'}</p>
        `;
    }

    return emailContent;
}

// Handle form submission
app.post('/submit', upload.array('attachments', 5), async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['requesterName', 'requesterEmail', 'request', 'location', 'productType'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: `Missing: ${missingFields.join(', ')}`
            });
        }

        // Validate field values
        if (!validations.email(req.body.requesterEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (!validations.requestType(req.body.request)) {
            return res.status(400).json({ error: `Invalid request type: ${req.body.request}` });
        }
        if (!validations.location(req.body.location)) {
            return res.status(400).json({ error: `Invalid location: ${req.body.location}` });
        }
        if (!validations.productType(req.body.productType)) {
            return res.status(400).json({ error: `Invalid product type: ${req.body.productType}` });
        }

        // Training-specific validations
        if (req.body.request === 'TRAINING') {
            const trainingFields = ['trainingScope', 'expectedDate', 'traineesNumber'];
            const missingTrainingFields = trainingFields.filter(field => !req.body[field]);
            
            if (missingTrainingFields.length > 0) {
                return res.status(400).json({ 
                    error: 'Missing required training fields',
                    details: missingTrainingFields.join(', ')
                });
            }
        }

        // Prepare Airtable record fields
        const fields = {
            'Requested by': req.body.requesterName,
            'Requester email': req.body.requesterEmail,
            'TYPE OF REQUEST': req.body.request,
            'Location': req.body.location,
            'PROJECT NAME': req.body.projectName || '',
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
        let attachments = [];
        if (req.files?.length > 0) {
            attachments = await Promise.all(req.files.map(processFile));
            fields['ATTACHMENTS'] = attachments;
        }

        // Create record in Airtable
        const record = await base(TABLE_NAME).create([{ fields }]);
        const issueId = record[0].fields['ISSUE ID'];

        // Prepare email options
        const locationAbbrev = locationMap[req.body.location] || 'OTH';
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.DESTINATION_EMAIL,
            cc: req.body.requesterEmail,
            subject: `[${issueId}]_[${locationAbbrev}]_NEW ${req.body.request} REQUEST`,
            html: generateEmailContent(req.body, issueId),
            attachments: req.files ? req.files.map(file => ({
                filename: file.originalname,
                content: file.buffer
            })) : []
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Send success response
        res.status(200).json({
            message: 'Request submitted successfully',
            issueId: issueId
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                details: 'Maximum file size is 50MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Too many files',
                details: 'Maximum 5 files allowed'
            });
        }
    }
    
    // Handle other errors
    console.error(err);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later'
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment check:');
    requiredEnvVars.forEach(varName => {
        console.log(`- ${varName}:`, process.env[varName] ? 'Set' : 'Missing');
    });
});