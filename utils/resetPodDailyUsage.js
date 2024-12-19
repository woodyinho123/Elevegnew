// utils/resetPodDailyUsage.js

function resetPodDailyUsage(pod) {
    const today = new Date().setHours(0, 0, 0, 0); // Start of the current day
    const lastUsage = pod.lastUsageDate ? new Date(pod.lastUsageDate).setHours(0, 0, 0, 0) : null;

    // Reset limits if last usage was not today
    if (!lastUsage || lastUsage < today) {
        pod.dailyWaterUsage = 0;
        pod.dailyFertilizerUsage = 0;
        pod.lastUsageDate = new Date();
    }
}

module.exports = resetPodDailyUsage;
