// routes/orders.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Tray = require('../models/Tray');
const Order = require('../models/Order');
const NutritionTip = require('../models/NutritionTip'); // Reference to NutritionTip model

// Generate or update cart based on crops in trays
router.post('/generate-cart', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Step 1: Retrieve all trays for the user
        const trays = await Tray.find({ userId });
        if (trays.length === 0) {
            return res.status(404).json({ error: 'No trays found for the user' });
        }

        // Step 2: Retrieve all crop data from NutritionTip collection
        const nutritionTips = await NutritionTip.find();
        const cropNameToIdMap = {};
        nutritionTips.forEach(nutritionTip => {
            cropNameToIdMap[nutritionTip.name] = nutritionTip._id; // Mapping crop name to its ObjectId
        });

        // Step 3: Aggregate seed requirements from trays
        const seedQuantities = {};
        trays.forEach(tray => {
            tray.podData.forEach(pod => {
                const cropId = cropNameToIdMap[pod.cropType]; // Look up cropId by name
                if (cropId) {
                    seedQuantities[cropId] = (seedQuantities[cropId] || 0) + (pod.quantity || 0);
                } else {
                    console.warn(`Crop type ${pod.cropType} not found in NutritionTip collection`);
                }
            });
        });

        // Step 4: Create cart items array
        const cartItems = Object.keys(seedQuantities).map(cropId => ({
            cropId, // Use the ObjectId from NutritionTip
            quantity: seedQuantities[cropId]
        }));

        // Step 5: Check if draft cart already exists
        let cart = await Order.findOne({ userId, status: 'draft' });
        if (cart) {
            // Update existing draft cart with new items
            cart.items = cartItems;
        } else {
            // Create new draft cart
            cart = new Order({ userId, items: cartItems, status: 'draft' });
        }

        // Step 6: Save the cart
        await cart.save();
        res.json({ message: 'Cart generated successfully', order: cart });
    } catch (error) {
        console.error('Error generating cart:', error);
        res.status(500).json({ error: 'Failed to generate cart' });
    }
});

// Get the draft cart
router.get('/cart', auth, async (req, res) => {
    try {
        const userId = req.user.id; // Ensure userId is defined
        const cart = await Order.findOne({ userId, status: 'draft' }).populate('items.cropId'); // Populate NutritionTip
        if (!cart) {
            return res.status(404).json({ error: 'No draft cart found' });
        }
        res.json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Update cart item quantity or remove item
router.put('/cart/item', auth, async (req, res) => {
    const { cropId, quantity } = req.body;

    try {
        const userId = req.user.id;
        const cart = await Order.findOne({ userId, status: 'draft' });
        if (!cart) {
            return res.status(404).json({ error: 'No draft cart found' });
        }

        // Find the item in the cart
        const itemIndex = cart.items.findIndex(item => item.cropId.equals(cropId));
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        if (quantity === 0) {
            // Remove item if quantity is zero
            cart.items.splice(itemIndex, 1);
        } else {
            // Update item quantity
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        res.json({ message: 'Cart updated', cart });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// Confirm the cart and place the order
router.post('/cart/confirm', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Order.findOne({ userId, status: 'draft' });
        if (!cart) {
            return res.status(404).json({ error: 'No draft cart found to confirm' });
        }

        // Update status to confirmed
        cart.status = 'confirmed';
        await cart.save();

        res.json({ message: 'Order placed successfully', order: cart });
    } catch (error) {
        console.error('Error confirming order:', error);
        res.status(500).json({ error: 'Failed to confirm order' });
    }
});

module.exports = router;
