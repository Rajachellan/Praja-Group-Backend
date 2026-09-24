require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cors());

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = process.env.PORT || 8000;

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

app.listen(port, () => {
    console.log(`Server Running Successfully On ${port}`);
});