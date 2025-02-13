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

// Middleware
app.use(cors());
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

// Helper function to validate request type
const validateRequestType = (type) => {
  const validTypes = ['SUPPORT', 'RCA', 'TRAINING', 'OTHER'];
  return validTypes.includes(type);
};

// Helper function to validate location
const validateLocation = (location) => {
  return Object.keys(locationMap).includes(location);
};

// Helper function to validate product type
const validateProductType = (type) => {
  const validTypes = ['STRING', 'CENTRAL', 'MVS', 'PVS', 'STORAGE', 'COMMUNICATION'];
  return validTypes.includes(type);
};

app.post('/submit', upload.array('attachments', 5), async (req, res) => {
  try {
    const {
      requesterName,
      requesterEmail,
      request,
      location,
      projectName,
      unitType,
      issue,
      description,
      serialNumbers,
      troubleshooting,
      scopeOfTraining,
      expectedDate,
      numberOfTrainees,
      gspTicket
    } = req.body;

    // Validation
    if (!validateRequestType(request)) {
      return res.status(400).json({ error: 'Invalid request type' });
    }
    if (!validateLocation(location)) {
      return res.status(400).json({ error: 'Invalid location' });
    }
    if (!validateProductType(unitType)) {
      return res.status(400).json({ error: 'Invalid product type' });
    }

    // Prepare Airtable record
    const fields = {
      'Requested by': requesterName,
      'TYPE OF REQUEST': request,
      'Location': location,
      'PROJECT NAME': projectName,
      'TYPE OF PRODUCT': unitType,
      'MODEL': unitType, // You might want to adjust this based on your needs
      'SERIAL NUMBERS': serialNumbers || '',
      'TROUBLESHOOTING STEPS COMPLETED': troubleshooting || '',
      'STATUS': 'NEW',
      'PRIORITY': '3- MEDIUM', // Default priority
      'GSP TICKET': gspTicket || '',
      'UPDATES': description || ''
    };

    // Add request-specific fields
    if (request === 'TRAINING') {
      fields['SCOPE OF TRAINING - for TRAINING'] = scopeOfTraining;
      fields['EXPECTED DATE - for TRAINING'] = expectedDate;
      fields['NUMBER OF TRAINEES - for TRAINING'] = parseFloat(numberOfTrainees);
    }

    // Create record in Airtable
    const record = await base(TABLE_NAME).create([{ fields }]);

    // Handle file attachments
    if (req.files && req.files.length > 0) {
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
    }

    // Prepare and send email
    const locationAbbrev = locationMap[location];
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
Product Type: ${unitType}
Serial Numbers: ${serialNumbers || 'N/A'}
Description: ${description || 'N/A'}
${request === 'TRAINING' ? `
Scope of Training: ${scopeOfTraining}
Expected Date: ${expectedDate}
Number of Trainees: ${numberOfTrainees}
` : ''}
GSP Ticket: ${gspTicket || 'N/A'}
`,
      attachments: req.files ? req.files.map(file => ({
        filename: file.originalname,
        content: file.buffer
      })) : []
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'Request submitted successfully',
      issueId: record[0].fields['ISSUE ID']
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({
      error: 'Failed to submit request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});