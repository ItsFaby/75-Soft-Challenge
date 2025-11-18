// ===== Date Utilities =====
// Utility functions for handling dates in Costa Rica timezone

/**
 * Get current date in Costa Rica timezone (UTC-6)
 * @param {number} daysOffset - Optional offset in days for development/testing
 * @returns {Date} Date object representing current time in Costa Rica
 */
function getCostaRicaDate(daysOffset = 0) {
    const now = new Date();
    // Convert to Costa Rica timezone (UTC-6)
    const crTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));

    // Apply offset if provided
    if (daysOffset !== 0) {
        crTime.setDate(crTime.getDate() + daysOffset);
    }

    return crTime;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getCostaRicaDate };
}
