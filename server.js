require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const Airtable = require('airtable');

// Initialize express app FIRST before using it
const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
const requiredEnvVars = [
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID',
    'AIRTABLE_TABLE_NAME',
    'EMAIL_USER',
    'EMAIL_PASS',
    'AIRTABLE_EVALUATIONS_BASE_ID',
    'AIRTABLE_EVALUATIONS_TABLE',
    'AIRTABLE_TRAININGS_TABLE',
    'AIRTABLE_AVAILTRAININGS_TABLE'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    process.exit(1);
}

// CORS configuration
app.use(cors({
    origin: ['https://aprovero.github.io', 'http://127.0.0.1:5500'], // Added localhost for testing
    methods: ['POST', 'GET'],
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

// Airtable configuration - main base
const mainBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

// Airtable configuration - evaluations & trainings base
const trainingBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_EVALUATIONS_BASE_ID);
const EVALUATIONS_TABLE_NAME = process.env.AIRTABLE_EVALUATIONS_TABLE;
const TRAININGS_TABLE_NAME = process.env.AIRTABLE_TRAININGS_TABLE;
const AVAILTRAININGS_TABLE_NAME = process.env.AIRTABLE_AVAILTRAININGS_TABLE;

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
// Validation utilities
const validOptions = {
    'TYPE OF REQUEST': ['SUPPORT', 'RCA', 'TRAINING', 'OTHER'],
    'Location': ['MEXICO', 'CENTRAL AMERICA', 'DOMINICAN REPUBLIC', 'COLOMBIA', 'BRAZIL', 'CHILE', 'OTHER'],
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
    'OTHER': 'OTH'
};

// Email validation utility
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Lookup training information from Airtable
app.get('/training/:id', async (req, res) => {
    try {
        const trainingId = req.params.id;
        
        if (!trainingId) {
            return res.status(400).json({
                error: 'Missing training ID',
                details: 'Training ID is required'
            });
        }
        
        // Query the Trainings table in the evaluation base to find the training info
        const records = await trainingBase(TRAININGS_TABLE_NAME).select({
            filterByFormula: `{Training ID} = "${trainingId}"`,
            maxRecords: 1
        }).firstPage();
        
        if (!records || records.length === 0) {
            return res.status(404).json({
                error: 'Training not found',
                details: 'No training found with the provided ID'
            });
        }
        
        const trainingData = records[0].fields;
        
        // Return the training information
        res.status(200).json({
            title: trainingData['Training Title'] || '',
            date: trainingData['Training Date'] || '',
            trainer: trainingData['Trainer'] || ''
        });
        
    } catch (error) {
        console.error('Error fetching training information:', error);
        res.status(500).json({
            error: 'Server error',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});
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

        // Create Airtable record in main base
        const record = await mainBase(TABLE_NAME).create([{ fields }]);
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

// Training Evaluation Route
app.post('/evaluation', async (req, res) => {
    try {
        console.log('Received evaluation submission:', req.body);
        
        // Extract evaluation data from request
        const { 
            trainingId,
            trainingTitle, 
            trainingDate, 
            trainer, 
            location,
            trainerKnowledge,
            trainerClarity,
            trainerResponsiveness,
            trainerEngagement,
            contentRelevance,
            contentDepth,
            contentMaterials,
            contentBalance,
            overallSatisfaction,
            comments,
            recommend,
            averageScore
        } = req.body;
        
        // Basic validation
        if (!trainingId || !trainingTitle || !trainingDate || !trainer || !location) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'Training information is required.'
            });
        }
        
        // Format date properly for Airtable
        let formattedDate;
        try {
            // Try to parse and format the date
            formattedDate = new Date(trainingDate).toISOString().split('T')[0];
        } catch (e) {
            // If parsing fails, use the original string
            formattedDate = trainingDate;
        }
        
        // Format data for Airtable
        const fields = {
            'Training ID': trainingId,
            'Training Title': trainingTitle,
            'Training Date': formattedDate, // Properly formatted date for Airtable
            'Trainer': trainer,
            'Training Type': location,
            
            // Ratings - storing as numbers for analytics
            'Trainer Knowledge': parseInt(trainerKnowledge),
            'Trainer Clarity': parseInt(trainerClarity),
            'Trainer Responsiveness': parseInt(trainerResponsiveness),
            'Trainer Engagement': parseInt(trainerEngagement),
            'Content Relevance': parseInt(contentRelevance),
            'Content Depth': parseInt(contentDepth),
            'Content Materials': parseInt(contentMaterials), 
            'Content Balance': parseInt(contentBalance),
            'Overall Satisfaction': parseInt(overallSatisfaction),
            
            // Comments and recommendation
            'Comments': comments || '',
            'Would Recommend': recommend === 'Yes' || recommend === true,
            
            // Average score for quick analytics (now including recommendation)
            'Average Score': parseFloat(averageScore) || 0,
            
            // Submission timestamp - properly formatted for Airtable
            'Submission Date': new Date().toISOString().split('T')[0]
        };
        
        // Create record in Airtable evaluations table
        const record = await trainingBase(EVALUATIONS_TABLE_NAME).create([{ fields }]);
        
        console.log('Evaluation recorded successfully with ID:', record[0].id);
        
        // Success response
        res.status(200).json({
            message: 'Evaluation submitted successfully',
            recordId: record[0].id
        });

    } catch (error) {
        console.error('Error processing evaluation submission:', error);
        console.error('Error stack:', error.stack);
        
        // Send appropriate error response
        res.status(500).json({
            error: 'Server error',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});
// GET endpoint to retrieve all available trainings
app.get('/api/trainings', async (req, res) => {
    try {
        console.log('Fetching available trainings from Airtable...');
        
        // Query the Available Trainings table in Airtable
        // Only fetch records where Active is checked/true
        const records = await trainingBase(AVAILTRAININGS_TABLE_NAME)
            .select({
                filterByFormula: '{Active} = TRUE()' // Filter for active courses only
            })
            .all();
        
        console.log(`Found ${records.length} active training records`);
        
        // Transform Airtable records to the format expected by the frontend
        const trainings = records.map(record => {
            const fields = record.fields;
            
            return {
                id: record.id,
                name: fields['Course Name'] || '',
                system: fields['System Type'] || 'other',
                level: fields['Knowledge Level'] || 'L1',
                levelText: getLevelText(fields['Knowledge Level']),
                model: fields['Model'] || '',
                duration: fields['Duration'] || '',
                content: fields['Content'] || [],
                requirements: fields['Requirements'] || [],
                active: fields['Active'] || false
            };
        });
        
        // Return the transformed training data
        res.status(200).json({
            success: true,
            trainings: trainings
        });
        
    } catch (error) {
        console.error('Error fetching training data:', error);
        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Helper function to get level text
function getLevelText(level) {
    switch(level) {
        case 'L1': return 'Level 1';
        case 'L2': return 'Level 2';
        case 'L3': return 'Level 3 (Certification)';
        default: return level || 'Unknown Level';
    }
}

// POST endpoint to add a new available training
app.post('/api/trainings', async (req, res) => {
    try {
        console.log('Received new training submission:', req.body);
        
        // Extract training data from request
        const { 
            name,
            system,
            level,
            model,
            duration,
            content,
            requirements
        } = req.body;
        
        // Basic validation
        if (!name || !system || !level || !model || !duration || !content || !requirements) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Validate system type
        if (!['pv', 'bess', 'other'].includes(system)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid system type'
            });
        }
        
        // Validate level
        if (!['L1', 'L2', 'L3'].includes(level)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid knowledge level'
            });
        }
        
        // Format data for Airtable
        const fields = {
            'Course Name': name,
            'System Type': system,
            'Knowledge Level': level,
            'Model': model,
            'Duration': duration,
            'Content': content,
            'Requirements': requirements,
            'Active': true // Set new courses to active by default
        };
        
        // Create record in Airtable available trainings table
        const record = await trainingBase(AVAILTRAININGS_TABLE_NAME).create([{ fields }]);
        
        console.log('Training course added successfully with ID:', record[0].id);
        
        // Success response
        res.status(200).json({
            success: true,
            message: 'Training course added successfully',
            recordId: record[0].id
        });
        
    } catch (error) {
        console.error('Error adding training course:', error);
        console.error('Error stack:', error.stack);
        
        // Send appropriate error response
        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment check:');
    requiredEnvVars.forEach(varName => {
        console.log(`- ${varName}:`, process.env[varName] ? 'Set' : 'Missing');
    });
});
