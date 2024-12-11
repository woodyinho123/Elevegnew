const express = require('express');
const router = express.Router();
const { getNextSundayMidnight } = require('../utils/dateUtils');

router.get('/test-next-sunday', (req, res) => {
    const { date } = req.query; // Pass the date as a query parameter
    if (!date) {
        return res.status(400).json({ error: 'Please provide a valid date in YYYY-MM-DD format.' });
    }

    const inputDate = new Date(date);
    if (isNaN(inputDate)) {
        return res.status(400).json({ error: 'Invalid date format.' });
    }

    const nextSunday = getNextSundayMidnight(inputDate);
    res.json({ inputDate, nextSunday });
});

module.exports = router;
