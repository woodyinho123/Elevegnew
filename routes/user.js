//routes/user.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
    console.log('Register request body:', req.body);  // Add this line here
    const { email, username, password, phone, profile: { height, weight, dietaryPreferences, activityLevel, healthGoals = [], mentalHealthGoals = [], membership, favouriteIngredients = [], dislikedIngredients = [], cuisinePreferences = [],
        specialDietaryRequirements = [],
        culturalDiets = [],
        chefInspiredMenus = [],
        seasonalInspiredMenus }
    } = req.body;
    console.log('Register request body:', req.body);
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Storing password as plain text (Not recommended for production)
        user = new User({
            email,
            username,
            password,
            phone,
            height,
            weight,
            dietaryPreferences,
            activityLevel,
            healthGoals,
            mentalHealthGoals,
            membership,
            favouriteIngredients,
            dislikedIngredients,
            cuisinePreferences,
            specialDietaryRequirements,
            culturalDiets,
            chefInspiredMenus,
            seasonalInspiredMenus,
            gameRegistration: false,  // ?? User is NOT registered for the game yet
            gameScore: 0,
            balance_tokens: 120, // Ensure tokens are being initialized
            trays: [{  // ?? Assign a starting tray
                number: 1,
                purchasedAt: new Date(),
                solarPanel: null,
                windmill: null,
                solarPanelExpired: false,
                windmillExpired: false,
                totalHarvests: 0
                }]
        });

        // **DEBUG: Log user before saving**
        console.log("User before saving:", user);

        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, 'YOUR_JWT_SECRET', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get user data
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        console.log('Fetched user:', user);
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update user data
router.put('/me', auth, async (req, res) => {
    const {
        email,
        username,
        password,
        phone,
        profile: {
            height,
            weight,
            dietaryPreferences,
            activityLevel,
            healthGoals,
            mentalHealthGoals,
            membership,
            favouriteIngredients,
            dislikedIngredients,
            cuisinePreferences,
            specialDietaryRequirements,
            culturalDiets,
            chefInspiredMenus,
            seasonalInspiredMenus
        }
    } = req.body;

    const updatedFields = {
        email,
        username,
        password,
        phone,
        height,
        weight,
        dietaryPreferences,
        activityLevel,
        healthGoals,
        mentalHealthGoals,
        membership,
        favouriteIngredients,
        dislikedIngredients,
        cuisinePreferences,
        specialDietaryRequirements,
        culturalDiets,
        chefInspiredMenus,
        seasonalInspiredMenus
    };
    console.log('Update request body:', req.body);

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('inventory');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user.' });
    }
});


module.exports = router;
