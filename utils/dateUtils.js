// utils/dateUtils.js

const getDailyDatesForWeek = (weekStartDate) => {
    const dailyDates = [];
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStartDate);
        dayDate.setDate(weekStartDate.getDate() + i); // Increment day by `i` days
        dailyDates.push(dayDate);
    }
    return dailyDates;
};

module.exports = { getDailyDatesForWeek };
