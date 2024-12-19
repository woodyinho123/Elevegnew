//models/user.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for individual seed pods
const seedPodSchema = new Schema({
    growthDays: { type: Number, default: 0 },
    growthToday: { type: Number, default: 0 },
    lastGrowthDate: { type: Date, default: null },
    status: {
        type: String,
        enum: ['unplanted', 'growing', 'ready for harvest'],
        default: 'unplanted',
    },
    planted: {
        type: Boolean,
        default: false, // New field to track if the pod is planted
    }
}, { _id: true }); // Enable automatic _id generation for subdocuments


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
        required: false,
        default:null
    },
    weight: {
        type: Number,
        required: false,
        default: null
    },
    dietaryPreferences: {
        type: String,
        required: false,
        default: ''
    },
    activityLevel: {
        type: String,
        required: false,
        default: ''
    },
    healthGoals: {
        type: [String],
        required: false,
        default: []
    },
    mentalHealthGoals: {
        type: [String],
        required: false,
        default: []
    },
    membership: {
        type: String,
        required: false
    },
    favouriteIngredients: {
        type: [String],
        required: false,
        default: []
    },
    dislikedIngredients: {
        type: [String],
        required: false,
        default: []
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
    },
    gameRegistration: {
        type: Boolean,
        default: false
    },
    gameScore: {
        type: Number,
        default: 0
    },

    seedPods: [seedPodSchema], // Use the seedPod schema for subdocuments
      // New Fields for Token Store
    balance_tokens: {
        type: Number,
        default: 100 // Starting tokens
    },
    inventory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item' // Reference to Item model
    }]
}, { collection: 'User' });

// Create the model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
