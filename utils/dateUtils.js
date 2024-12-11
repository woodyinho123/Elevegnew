// utils/dateUtils.js

// Existing function to get daily dates for a week
const getDailyDatesForWeek = (weekStartDate) => {
    const dailyDates = [];
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStartDate);
        dayDate.setDate(weekStartDate.getDate() + i); // Increment day by `i` days
        dailyDates.push(dayDate);
    }
    return dailyDates;
};

// New function to calculate the next Sunday at midnight
const getNextSundayMidnight = (date) => {
    const nextSunday = new Date(date);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Add days to reach the next Sunday
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    nextSunday.setDate(date.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0); // Set to midnight

    return nextSunday;
};

module.exports = {
    getDailyDatesForWeek,
    getNextSundayMidnight // Export the new function
};
