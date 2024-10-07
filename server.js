//server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const mealPlanMetrics = require('./routes/mealPlanMetrics');
const schedule = require('node-schedule');
const Notification = require('./models/Notification');
const User = require('./models/User'); // Import the User model
const generateNextWeekMealPlan = require('./services/mealPlanService').generateNextWeekMealPlan; // Assuming mealPlanService will be created
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
app.use('/api/mealplan', mealPlanMetrics);
app.use('/api/journal', require('./routes/journal'));  // Journal routes


const job = schedule.scheduleJob('0 0 * * 0', async function () {
    try {
        const users = await User.find(); // Get all users to generate meal plans for

        for (const user of users) {
            // Generate meal plan for the next week
            const nextWeekPlan = await generateNextWeekMealPlan(user);

            // Notify the user that their next week's plan is ready
            const newNotification = new Notification({
                userId: user._id,
                type: 'reminder',
                message: 'Your next week’s meal plan is ready!',
                date: new Date()
            });
            await newNotification.save();
        }

        console.log('Next week’s meal plans generated for all users');
    } catch (error) {
        console.error('Error generating meal plans:', error.message);
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
