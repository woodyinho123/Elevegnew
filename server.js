//server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const mealPlanMetrics = require('./routes/mealPlanMetrics');
const schedule = require('node-schedule');
const Notification = require('./models/Notification');
const User = require('./models/User'); // Import the User model
const generateNextWeekMealPlan = require('./services/mealPlanService').generateNextWeekMealPlan; // Assuming mealPlanService will be created
const ordersRouter = require('./routes/orders');
const userRoutes = require('./routes/user');
const seedPodsRoutes = require('./routes/seedPods');
const cron = require('node-cron');
const Transaction = require('./models/Transaction'); // Ensure this import
const Fertilizer = require('./models/Fertilizer');

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
app.use('/api/orders', ordersRouter);
app.use('/api/game', require('./routes/leaderboard'));
app.use('/api/token-store', require('./routes/tokenStore'));
app.use('/api/utils', require('./routes/utils'));
app.use('/api', userRoutes);
app.use('/api', seedPodsRoutes);
app.use('/api/seedPods', require('./routes/seedPods'));
app.use('/api/seedPods', require('./routes/seedPods'))


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

// Scheduled job to auto-confirm orders and lock weeks
schedule.scheduleJob('0 0 * * 3', async function () { // Runs every Wednesday (3 days after Sunday midnight)
    try {
        const users = await User.find();

        for (const user of users) {
            const currentWeekNumber = getCurrentWeekNumber();

            // Auto-confirm draft orders for the current week
            const order = await Order.findOne({ userId: user._id, status: 'draft' });
            if (order) {
                order.status = 'confirmed';
                await order.save();
                console.log(`Order for user ${user._id} auto-confirmed.`);
            }

            // Lock recommendations for the current week
            const recommendations = await Recommendations.findOne({ userId: user._id });
            if (recommendations) {
                const lockKey = `week${currentWeekNumber}Locked`;
                recommendations[lockKey] = true;
                await recommendations.save();
                console.log(`Recommendations for week ${currentWeekNumber} locked for user ${user._id}`);
            }

            // Lock trays for the current week
            const trayId = `Tray${currentWeekNumber}-${user._id}`;
            const tray = await Tray.findOne({ userId: user._id, trayId });
            if (tray) {
                tray.locked = true;
                tray.updatedAt = new Date();
                await tray.save();
                console.log(`Tray for week ${currentWeekNumber} locked for user ${user._id}`);
            }

            // Notify the user about auto-confirmation and locked status
            const notification = new Notification({
                userId: user._id,
                type: 'info',
                message: `Your order for week ${currentWeekNumber} has been auto-confirmed. Skipping is now disabled for this week.`,
                date: new Date()
            });
            await notification.save();
        }

        console.log('Orders auto-confirmed and weeks locked for all users.');
    } catch (error) {
        console.error('Error auto-confirming orders:', error.message);
    }
});


// Background job to automatically harvest pods
cron.schedule('0 0 * * *', async () => { // Runs every day at midnight
    console.log('Running the auto-harvest job (daily at midnight)...');

    try {
        const users = await User.find();

        for (const user of users) {
            const podsToHarvest = user.seedPods.filter(pod => pod.growthDays >= 28 && pod.status === 'growing');

            if (podsToHarvest.length > 0) {
                let transactions = [];

                podsToHarvest.forEach(pod => {
                    pod.status = 'harvested';
                    user.balance_tokens += 20;
                    user.gameScore += 20;

                    // Prepare transaction records
                    transactions.push({
                        userId: user._id,
                        itemId: pod._id, // Adjust as needed
                        timestamp: new Date(),
                        amount_tokens: 20,
                        quantity: 1,
                        type: 'auto-harvest'
                    });
                });

                // Save the updated user
                await user.save();

                // Insert all transactions at once
                await Transaction.insertMany(transactions);

                console.log(`Auto-harvested ${podsToHarvest.length} pods for user ${user._id}`);
            }
        }

        console.log('Auto-harvest job completed.');
    } catch (error) {
        console.error('Error during auto-harvest job:', error);
    }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
