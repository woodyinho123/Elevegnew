//models/user.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for individual seed pods
const seedPodSchema = new Schema({
    growthDays: { type: Number, default: 0 },
    growthToday: { type: Number, default: 0 },
    dailyWaterUsage: { type: Number, default: 0 }, // Tracks daily water usage
    dailyFertilizerUsage: { type: Number, default: 0 }, // Tracks daily fertilizer usage
    lastUsageDate: { type: Date, default: null }, // Tracks the last usage date for this pod
    lastGrowthDate: { type: Date, default: null },
    status: {
        type: String,
        enum: ['unplanted', 'growing', 'ready for harvest', 'harvested'],
        default: 'unplanted',
    },
    planted: {
        type: Boolean,
        default: false, // New field to track if the pod is planted
    },
    tray: { type: Number, default: null }, // Add this field
    position: Number,  
    fertilizerApplied: { type: Boolean, default: false }, // Tracks if fertilizer has been applied at least once
}, { _id: true }); // Enable automatic _id generation for subdocuments

const traySchema = new Schema({
    number: { type: Number, required: true }, // Tray number (1-4)
    purchasedAt: { type: Date, default: Date.now }, // Purchase timestamp

    solarPanel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',  // or ref: 'SolarPanel' if you had a separate model
        default: null
    },
    windmill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        default: null
    },
    solarPanelExpired: {
        type: Boolean,
        default: false
    },
    windmillExpired: { type: Boolean, default: false },

    totalHarvests: { type: Number, default: 0 }  // Number of times the tray has been fully harvested (14 pods = 1 harvest)
});

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
        default: 120 // Starting tokens
    },

    trays: {             //give user a tray upon registeration
        type: [traySchema],
        default: () => [{
            number: 1,
            purchasedAt: new Date(),
            solarPanel: null,
            windmill: null,
            solarPanelExpired: false,
            windmillExpired: false,
            totalHarvests: 0
        }]
    },

    solarPanels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item' // Reference to the Item model (for solar panels)
    }],
    windmills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item' // Reference to the Item model (for windmills)
    }],
    fertilizers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fertilizer' // Reference to  fertilizer model
    }],
    

    inventory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item' // Reference to Item model
    }]

    

}, { collection: 'User' });

// Create the model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
