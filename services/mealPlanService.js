// services/mealPlanService.js


const Recommendations = require('../models/Recommendation');
const JournalEntry = require('../models/JournalEntry');
const OpenAI = require('openai');
const openai = new OpenAI();
const Notification = require('../models/Notification'); // Import the Notification model

// Function to calculate total nutrient intake
const calculateNutrientIntake = (meals) => {
    let totalNutrients = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
    };

    meals.forEach(meal => {
        totalNutrients.calories += meal.calories;
        totalNutrients.protein += meal.protein;
        totalNutrients.carbs += meal.carbs;
        totalNutrients.fats += meal.fats;
    });

    return totalNutrients;
};

// Function to compare caloric needs vs intake
const compareCaloricNeeds = (caloricNeeds, nutrientIntake) => {
    return {
        surplusOrDeficit: nutrientIntake.calories - caloricNeeds,
        ...nutrientIntake
    };
};

// Function to calculate adherence to meal plans
const calculateAdherence = (plannedMeals, consumedMeals) => {
    // Calculate adherence percentage based on the similarity between planned and consumed meals
    const adherence = (consumedMeals.length / plannedMeals.length) * 100;
    return adherence;
};

// Helper function to extract insights from journal entries over the last 4 weeks
async function extractJournalInsights(userId) {
    // Calculate the date 4 weeks ago from today
    const start = new Date();
    start.setDate(start.getDate() - 28);

    // Find journal entries for the user from the past 4 weeks
    const journalEntries = await JournalEntry.find({
        userId,
        date: { $gte: start } // Entries within the last 4 weeks
    });

    let totalMood = 0;
    let totalEnergy = 0;
    let totalMacros = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    let count = journalEntries.length;

    // Aggregate insights from journal entries
    journalEntries.forEach(entry => {
        totalMood += entry.mood.rating;
        totalEnergy += entry.exercise.energyLevel || 0;
        if (entry.macros.knowMacros) {
            totalMacros.calories += entry.macros.details.calories || 0;
            totalMacros.protein += entry.macros.details.protein || 0;
            totalMacros.carbs += entry.macros.details.carbs || 0;
            totalMacros.fats += entry.macros.details.fats || 0;
        }
    });

    // Calculate averages or other relevant metrics
    const averageMood = count > 0 ? totalMood / count : 0;
    const averageEnergy = count > 0 ? totalEnergy / count : 0;
    const averageMacros = {
        calories: count > 0 ? totalMacros.calories / count : 0,
        protein: count > 0 ? totalMacros.protein / count : 0,
        carbs: count > 0 ? totalMacros.carbs / count : 0,
        fats: count > 0 ? totalMacros.fats / count : 0
    };

    return {
        averageMood,
        averageEnergy,
        averageMacros
    };
}


// New function to generate next week's meal plan
async function generateNextWeekMealPlan(user, user_data, crop_data) {

    try {

        const userId = user._id;


        // Normalize user properties to handle inconsistent data
        const height = user.height || 'Not provided';
        const weight = user.weight || 'Not provided';
        const dietaryPreferences = user.dietaryPreferences || 'None';
        const activityLevel = user.activityLevel || 'Unknown';
        const healthGoals = user.healthGoals.length > 0 ? user.healthGoals.join(', ') : 'None';
        const favouriteIngredients = user.favouriteIngredients.length > 0 ? user.favouriteIngredients.join(', ') : 'None';
        const dislikedIngredients = user.dislikedIngredients.length > 0 ? user.dislikedIngredients.join(', ') : 'None';

        // Log user data to check if required fields are present
        console.log(`Generating meal plan for user ID: ${userId} with normalized data.`);

       


        const journalInsights = await extractJournalInsights(userId) || {
            averageMood: 'No data',
            averageEnergy: 'No data',
            averageMacros: { calories: 'No data', protein: 'No data', carbs: 'No data', fats: 'No data' }
        };

        // Find the last generated week
        let userRecommendations = await Recommendations.findOne({ userId });
        let nextWeek = 1;
        if (userRecommendations) {
            const existingWeeks = Object.keys(userRecommendations.toObject()).filter(key => key.startsWith('week'));
            if (existingWeeks.length > 0) {
                const lastWeek = Math.max(...existingWeeks.map(week => parseInt(week.replace('week', ''))));
                nextWeek = lastWeek + 1;
            }
        } else {
            userRecommendations = new Recommendations({ userId });
        }

        // Ensure crop_data is provided
        if (!crop_data || !Array.isArray(crop_data)) {
            console.error('crop_data is missing or not an array. Setting as an empty array.');
            crop_data = [];
        }

        // Construct OpenAI prompt and generate next week's plan
        const prompt = constructPromptForNextWeek({
            height,
            weight,
            dietaryPreferences,
            activityLevel,
            healthGoals,
            favouriteIngredients,
            dislikedIngredients
        }, journalInsights, nextWeek, crop_data);

        console.log('OpenAI prompt:', prompt); // Log the prompt for debugging

        // Generate the response from OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        });

        if (!response || !response.choices || response.choices.length === 0) {
            console.error('OpenAI did not return a valid response');
            return;
        }



        const weekPlan = response.choices[0].message.content;
        userRecommendations[`week${nextWeek}`] = weekPlan;
        await userRecommendations.save();

        // Here you add the line to auto-populate the trays after generating the meal plan
        await autoPopulateTrays(userId);  // <-- ADD THIS LINE

        // Add notification logic here after successfully saving the next week's plan
        const newNotification = new Notification({
            userId: user._id,
            type: 'reminder',
            message: 'Your next week’s meal plan is ready!',
            date: new Date()
        });
        await newNotification.save(); // Save the notification in the database


        return weekPlan;
    } catch (error) {
        console.error('Error in generateNextWeekMealPlan:', error.message);
    }
}

// Helper function to construct the OpenAI prompt for next week's meal plan
function constructPromptForNextWeek(user, journalInsights, weekNumber, crop_data) {
    let prompt = `
             User Data:
        Height: ${user.height || 'Not provided'}
        Weight: ${user.weight || 'Not provided'}
        Dietary Preferences: ${user.DietaryPreferences || 'Not provided'}
        Activity Level: ${user.ActivityLevel || 'Not provided'}
        Health Goals: ${user.HealthGoals || 'Not provided'}
        Favourite Ingredients: ${user.FavouriteIngredients || 'None'}
        Disliked Ingredients: ${user.DislikedIngredients || 'None'}

        Recent Journal Insights:
        Average Mood: ${journalInsights.averageMood}
        Average Energy Level: ${journalInsights.averageEnergy}
        Average Macros - Calories: ${journalInsights.averageMacros.calories}, Protein: ${journalInsights.averageMacros.protein}, Carbs: ${journalInsights.averageMacros.carbs}, Fats: ${journalInsights.averageMacros.fats}

        Available Crops:
    `;
    // Ensure crop_data is provided and is an array, fallback to an empty array if undefined
    if (!crop_data || !Array.isArray(crop_data)) {
        console.error('crop_data is missing or not an array. Setting as an empty array.');
        crop_data = []; // Fallback to an empty array
    }

    // Now safely iterate over crop_data
    crop_data.forEach(crop => {
        prompt += `\n- ${crop}`;
    });

    prompt += `
    Based on the user's profile and recent journal insights, create a unique 7-day meal plan for Week ${weekNumber}.
    `;

    return prompt;
}




module.exports = {
    calculateNutrientIntake,
    compareCaloricNeeds,
    calculateAdherence,
    generateNextWeekMealPlan, // Don't forget to export this function
       extractJournalInsights // Add this if you want to use it elsewhere
};
