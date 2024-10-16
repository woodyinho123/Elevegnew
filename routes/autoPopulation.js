// routes/autoPopulation.js

const express = require('express');
const router = express.Router();
const Tray = require('../models/Tray'); // Importing the Tray model
const Recommendation = require('../models/Recommendation'); // Importing the Recommendation model
const auth = require('../middleware/auth'); // Middleware for authentication

const autoPopulateTrays = async (userId) => {
    try {
        // Step 1: Fetch the recommendations for the specific user
        const userRecommendation = await Recommendation.findOne({ userId });

        if (!userRecommendation) {
            console.log(`No recommendations found for user: ${userId}`);
            return; // Exit if no recommendations are found
        }

        // Dynamically get all available weeks from the userRecommendation object
        const weeks = Object.keys(userRecommendation.toObject())
            .filter(key => key.startsWith('week')) // Find all fields starting with 'week'
            .map(weekKey => userRecommendation[weekKey]); // Map to actual week meal plans

        // Step 2: Loop through all available weeks (not just limited to weeks 1-4)
        for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
            const weekMealPlan = weeks[weekIndex];
            let crops = extractCropsFromMealPlan(weekMealPlan);

            // Ensure userId is defined
            if (!userId) {
                console.error(`userId is undefined for recommendations.`);
                continue; // Skip if no userId is found
            }

            // Ensure we have 10 pods by repeating crops if necessary
            while (crops.length < 10) {
                crops = crops.concat(crops.slice(0, 10 - crops.length));
            }

            let plantingDate = new Date();
            let harvestDate = new Date();

            // Calculate planting and harvest dates based on the week index
            plantingDate.setDate(plantingDate.getDate() - (weekIndex * 7)); // Adjust planting date
            harvestDate.setDate(plantingDate.getDate() + 28); // Harvest is 28 days after planting

            // Generate a unique trayId for each user and week
            const trayId = `Tray${weekIndex + 1}-${userId.toString()}`;

            // Check if a tray already exists for this user and week
            const existingTray = await Tray.findOne({ trayId });
            if (existingTray) {
                console.log(`Tray already exists for userId: ${userId}, trayId: ${trayId}`);
                continue; // Skip if a tray already exists
            }

            // Create a new tray with 10 pods based on the crops from the meal plan
            const newTray = new Tray({
                userId,
                trayId,
                podData: crops.slice(0, 10).map((crop, index) => ({
                    podId: `Pod${weekIndex + 1}-${index + 1}`, // Unique pod ID for each crop
                    cropType: crop.cropType,
                    plantingDate,
                    harvestDate,
                }))
            });

            // Save the new tray to the database
            await newTray.save();
            console.log(`Created tray for userId: ${userId}, trayId: ${trayId} for Week ${weekIndex + 1}`);
        }

        console.log(`Trays auto-populated successfully for user: ${userId}`);
    } catch (err) {
        console.error('Error auto-populating trays:', err.message);
    }
};


// Helper function to extract crops from a meal plan (week's recommendation)
const extractCropsFromMealPlan = (mealPlanString) => {
    // Expand the list of known crops to include 'baby' and 'micro' crops
    const crops = [];
    const knownCrops = [
        "Spinach", "Basil", "Kale", "Mint", "Chives", "Cilantro", "Parsley", "Radish", "Broccoli",
        "Arugula", "Beet", "Peas", "Mustard Greens", "Peppercress", "Microgreen Mix"
    ];

    // Log the meal plan string being processed
    console.log(`Parsing crops from meal plan: ${mealPlanString}`);

    // Check if the meal plan contains any of the known crops
    knownCrops.forEach(crop => {
        const regex = new RegExp(`\\b(micro|baby)?\\s*${crop}`, "i");  // Match crops with 'baby' or 'micro' prefixes
        if (mealPlanString && regex.test(mealPlanString)) {
            crops.push({ cropType: crop }); // Add crop to the list
        }
    });

    return crops; // Return the extracted crops
};

// Route to trigger the auto-population of trays for a specific user
router.post('/populate-trays', auth, async (req, res) => {
    try {
        // Extract userId from the authenticated user (or request body if needed)
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Call the autoPopulateTrays function for this specific user
        await autoPopulateTrays(userId);
        res.status(200).json({ message: `Trays populated successfully for user: ${userId}.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Failed to populate trays.' });
    }
});

module.exports = router;
