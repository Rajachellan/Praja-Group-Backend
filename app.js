require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.set('trust proxy', true);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// CORS configuration to allow all origins, methods, headers and credentials
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = process.env.PORT || 4005;

const mongoose = require('mongoose');

// Health Check Endpoints
const healthHandler = (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
    res.status(200).json({
        status: 'ok',
        database: dbStatus,
        activePort: port,
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
    });
};
app.get('/', healthHandler);
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Db Connect
const dbConnect = require('./config/db');
dbConnect();

// Contact Form Routes
const contactFormRoute = require('./routes/contactFormRoute');
app.use('/api', contactFormRoute);

// User Routes
const userRoutes = require('./routes/userController');
app.use('/api', userRoutes);

// Blog Routes
const blogRoutes = require('./routes/blogRoutes');
app.use('/api', blogRoutes);

// Image Upload Routes
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);


// Career Routes
const careerRoute=require('./routes/careerRoute')
app.use('/api',careerRoute)

// Job Enquiry Routes
const enquiryRoutes=require('./routes/jobRoute')
app.use('/api',enquiryRoutes)


app.listen(port, () => {
    console.log(`Server Running Successfully On primary port ${port}`);
});

// Also bind to port 8000 as fallback so Coolify traffic succeeds whether routed to 4005 or 8000
const fallbackPort = 8000;
if (Number(port) !== fallbackPort) {
    try {
        const fallbackServer = app.listen(fallbackPort, () => {
            console.log(`Server also listening on fallback port ${fallbackPort}`);
        });
        fallbackServer.on('error', (err) => {
            console.log(`Fallback port ${fallbackPort} note: ${err.message}`);
        });
    } catch (e) {
        console.log(`Fallback server notice: ${e.message}`);
    }
}