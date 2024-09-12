//models/user.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema first
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\d{10,15}$/, 'Please enter a valid phone number']
    },
    height: {
        type: Number,
        required: false
    },
    weight: {
        type: Number,
        required: false
    },
    dietaryPreferences: {
        type: String,
        required: false
    },
    activityLevel: {
        type: String,
        required: false
    },
    healthGoals: {
        type: [String],
        required: false
    },
    mentalHealthGoals: {
        type: [String],
        required: false
    },
    membership: {
        type: String,
        required: false
    },
    favouriteIngredients: {
        type: [String],
        required: false
    },
    dislikedIngredients: {
        type: [String],
        required: false
    },

    cuisinePreferences: {
        type: [String],
        required: false
    },
    specialDietaryRequirements: {
        type: [String],
        required: false
    },

    culturalDiets: {
        type: [String],
        required: false
    },

    chefInspiredMenus: {
        type: [String],
        required: false
    },

    seasonalInspiredMenus: {
        type: String, // This is a Yes/No option
        enum: ['Yes', 'No'],
        required: false
    }

}, { collection: 'User' });

// Create the model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
