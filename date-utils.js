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

/**
 * Format a Date object to YYYY-MM-DD string using local time
 * This avoids UTC conversion issues with toISOString()
 * @param {Date} date - Date object to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
function formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getCostaRicaDate, formatDateString };
}
