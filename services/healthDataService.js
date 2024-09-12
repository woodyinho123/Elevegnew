/*     const axios = require('axios');
const fetchHealthData = require('./fetchHealthData');


const fetchHealthData = async (userId) => {
    try {
        // Example API endpoint, replace with actual health API endpoint
        //Replace https://healthapi.com/user/${userId}/data with the actual API endpoint from the health data provider you're integrating with (like Google Fit or Apple Health).
        
        const response = await axios.get(`https://healthapi.com/user/${userId}/data`, {
            headers: {
                'Authorization': `Bearer YOUR_API_TOKEN`, // Replace with actual token or API key
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching health data:', error);
        throw error;
    }
};

const alignMealPlansWithHealthData = async (userId) => {
    try {
        const healthData = await fetchHealthData(userId);

        // Example logic to adjust meal plans based on health data
        // Replace this with your actual logic
        if (healthData.activityLevel === 'high') {
            // Increase protein intake if the user is engaged in muscle-building exercises
            console.log('Adjusting meal plans for high activity level...');
            // Implement logic to modify meal plan metrics here
        }

        return healthData;
    } catch (error) {
        console.error('Error aligning meal plans with health data:', error);
        throw error;
    }
};


module.exports = {
    fetchHealthData,
    alignMealPlansWithHealthData
};
