//server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const mealPlanMetrics = require('./routes/mealPlanMetrics');
// Load environment variables
dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/user', require('./routes/user'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/nutrition-tips', require('./routes/nutritionTips')); // Add this line
// Define Routes
app.use('/api/rewards', require('./routes/rewards'));
// server.js
app.use('/api/user-plants', require('./routes/userPlants'));  
// Add the new routes
app.use('/api/mealplans', require('./routes/mealPlan'));
app.use('/api/trays', require('./routes/tray'));
// Include the auto-population route
app.use('/api/auto-population', require('./routes/autoPopulation'));
const PORT = process.env.PORT || 5000;
app.use('/api/mealplan', mealPlanMetrics);
app.use('/api/journal', require('./routes/journal'));  // Journal routes
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
