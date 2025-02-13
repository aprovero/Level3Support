require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Airtable = require('airtable');
const multer = require('multer');
const moment = require('moment');

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

// Enhanced validation functions with logging
const validateRequestType = (type) => {
    const validTypes = ['SUPPORT', 'RCA', 'TRAINING', 'OTHERS'];
    const isValid = validTypes.includes(type);
    console.log('Request type validation:', type, isValid);
    return isValid;
};

const validateLocation = (location) => {
    const validLocations = ['MEXICO', 'CENTRAL AMERICA', 'DOMINICAN REPUBLIC', 'COLOMBIA', 'BRAZIL', 'PERU', 'CHILE', 'OTHERS'];
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
    'PERU': 'PER',
    'CHILE': 'CHL',
    'OTHER': 'OTH'
};

app.post('/submit', upload.array('attachments', 5), async (req, res) => {
    try {
        console.log('Received form data:', req.body);
        console.log('Received files:', req.files?.length || 0, 'files');

        const {
            requesterName,
            requesterEmail,
            request,
            location,
            projectName,
            productType,
            model,
            description,
            serialNumbers,
            troubleshooting,
            trainingScope,
            expectedDate,
            traineesNumber,
            gspTicket
        } = req.body;

        // Validation with detailed error messages
        if (!validateRequestType(request)) {
            console.error('Invalid request type:', request);
            return res.status(400).json({ error: `Invalid request type: ${request}` });
        }

        if (!validateLocation(location)) {
            console.error('Invalid location:', location);
            return res.status(400).json({ error: `Invalid location: ${location}` });
        }

        if (!validateProductType(productType)) {
            console.error('Invalid product type:', productType);
            return res.status(400).json({ error: `Invalid product type: ${productType}` });
        }

        // Prepare Airtable record
        const fields = {
            'Requested by': requesterName,
            'TYPE OF REQUEST': request,
            'Location': location,
            'PROJECT NAME': projectName,
            'TYPE OF PRODUCT': productType,
            'MODEL': model || productType,
            'SERIAL NUMBERS': serialNumbers || '',
            'TROUBLESHOOTING STEPS COMPLETED': troubleshooting || '',
            'STATUS': 'NEW',
            'PRIORITY': '3- MEDIUM',
            'GSP TICKET': gspTicket || '',
            'UPDATES': description || ''
        };

        // Add training-specific fields
        if (request === 'TRAINING') {
            fields['SCOPE OF TRAINING - for TRAINING'] = trainingScope;
            fields['EXPECTED DATE - for TRAINING'] = expectedDate;
            fields['NUMBER OF TRAINEES - for TRAINING'] = parseFloat(traineesNumber) || 0;
        }

        console.log('Creating Airtable record with fields:', fields);

        // Create record in Airtable
        const record = await base(TABLE_NAME).create([{ fields }]);
        console.log('Airtable record created:', record[0].id);

        // Handle file attachments
        if (req.files && req.files.length > 0) {
            console.log('Processing attachments...');
            const attachmentUpdates = await Promise.all(req.files.map(file => {
                return base(TABLE_NAME).update(record[0].id, {
                    'ATTACHMENTS': [
                        {
                            url: file.buffer.toString('base64'),
                            filename: file.originalname,
                            type: file.mimetype
                        }
                    ]
                });
            }));
            console.log('Attachments processed:', attachmentUpdates.length);
        }

        // Prepare and send email
        const locationAbbrev = locationMap[location] || 'OTH';
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'coe.latam@sungrowamericas.com',
            cc: requesterEmail,
            subject: `[${locationAbbrev}]_[${projectName}]_NEW ${request} REQUEST_${record[0].fields['ISSUE ID']}`,
            text: `
A new ${request} request has been submitted:

Issue ID: ${record[0].fields['ISSUE ID']}
Requester: ${requesterName}
Email: ${requesterEmail}
Location: ${location}
Project Name: ${projectName}
Product Type: ${productType}
Serial Numbers: ${serialNumbers || 'N/A'}
Description: ${description || 'N/A'}
${request === 'TRAINING' ? `
Scope of Training: ${trainingScope}
Expected Date: ${expectedDate}
Number of Trainees: ${traineesNumber}
` : ''}
GSP Ticket: ${gspTicket || 'N/A'}
`,
            attachments: req.files ? req.files.map(file => ({
                filename: file.originalname,
                content: file.buffer
            })) : []
        };

        console.log('Sending email...');
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');

        res.status(200).json({
            message: 'Request submitted successfully',
            issueId: record[0].fields['ISSUE ID']
        });

    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).json({
            error: 'Failed to submit request',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment check:');
    console.log('- AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? 'Set' : 'Missing');
    console.log('- AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID ? 'Set' : 'Missing');
    console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
    console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
});