const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
    const { email, username, password, phone, profile } = req.body;
    console.log('Register request body:', req.body);
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Storing password as plain text (Not recommended for production)
        user = new User({ email, username, password, phone, profile });
        await user.save();

        console.log('Plaintext Password during Registration:', user.password);

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

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        console.log('Stored Plaintext Password:', user.password);
        if (password !== user.password) {
            console.log('Password does not match');
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

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

module.exports = router;
