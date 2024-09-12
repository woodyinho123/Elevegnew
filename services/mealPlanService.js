// services/mealPlanService.js

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

module.exports = {
    calculateNutrientIntake,
    compareCaloricNeeds,
    calculateAdherence
};
