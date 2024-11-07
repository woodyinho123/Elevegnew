// routes/autoPopulation.js

const express = require('express');
const router = express.Router();
const Tray = require('../models/Tray'); // Importing the Tray model
const Recommendation = require('../models/Recommendation'); // Importing the Recommendation model
const auth = require('../middleware/auth'); // Middleware for authentication

const autoPopulateTrays = async (userId) => {
    try {
        // Fetch the user's recommendations once
        const userRecommendation = await Recommendation.findOne({ userId });
        if (!userRecommendation) {
            console.log(`No recommendations found for user: ${userId}`);
            return;
        }

        // Parse all weeks' meal plans at once
        const weeks = Object.keys(userRecommendation.toObject())
            .filter(key => key.startsWith('week'))
            .map(weekKey => userRecommendation[weekKey]);

        // Fetch existing trays once for this user
        const existingTrays = await Tray.find({ userId });
        const existingTrayIds = new Set(existingTrays.map(tray => tray.trayId));

        // Accumulate new trays in an array for bulk insert
        const traysToInsert = [];

        // Loop through each week's meal plan
        for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
            const weekMealPlan = weeks[weekIndex];
            let crops = extractCropsFromMealPlan(weekMealPlan);

            // Ensure we have 14 crops, duplicating if necessary
            while (crops.length < 14) {
                crops = crops.concat(crops.slice(0, 14 - crops.length));
            }

            // Generate unique trayId and check if it already exists
            const trayId = `Tray${weekIndex + 1}-${userId}`;
            if (existingTrayIds.has(trayId)) {
                console.log(`Tray already exists for userId: ${userId}, trayId: ${trayId}`);
                continue;
            }

            // Set planting and harvest dates
            const plantingDate = new Date();
            plantingDate.setDate(plantingDate.getDate() - (weekIndex * 7));
            const harvestDate = new Date(plantingDate);
            harvestDate.setDate(harvestDate.getDate() + 28);

            // Create tray data with 14 pods
            const newTray = {
                userId,
                trayId,
                podData: crops.slice(0, 14).map((crop, index) => ({
                    podId: `Pod${weekIndex + 1}-${index + 1}`,
                    cropType: crop.cropType,
                    plantingDate,
                    harvestDate
                })),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            traysToInsert.push(newTray);
            console.log(`Prepared tray for userId: ${userId}, trayId: ${trayId}`);
        }

        // Insert all new trays in a single bulk operation
        if (traysToInsert.length > 0) {
            await Tray.insertMany(traysToInsert);
            console.log(`Inserted ${traysToInsert.length} new trays for user: ${userId}`);
        }
    } catch (err) {
        console.error('Error in auto-populating trays:', err.message);
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
