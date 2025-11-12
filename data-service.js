// ===== Data Service Abstraction Layer =====
// This service abstracts the data source (Mock vs Firebase)

class DataService {
    constructor() {
        this.useMockData = AppConfig.USE_MOCK_DATA;
        this.initialized = false;
    }
    
    // Initialize the data service
    async initialize() {
        if (this.initialized) return true;
        
        try {
            if (this.useMockData) {
                console.log('Using Mock Data');
                // Mock data is already initialized in mockData.js
                this.initialized = true;
            } else {
                console.log('Using Firebase');
                await firebaseService.initialize();
                this.initialized = true;
            }
            
            return true;
        } catch (error) {
            console.error('Data service initialization error:', error);
            // Fallback to mock data if Firebase fails
            console.log('Falling back to Mock Data');
            this.useMockData = true;
            this.initialized = true;
            return true;
        }
    }
    
    // ===== User Operations =====
    
    async getAllUsers() {
        if (this.useMockData) {
            const data = await MockAPI.getAllData();
            return data.users;
        } else {
            return await firebaseService.getAllUsers();
        }
    }
    
    async getUser(userName) {
        if (this.useMockData) {
            return await MockAPI.getUserData(userName);
        } else {
            return await firebaseService.getUser(userName);
        }
    }
    
    async saveUser(userName, userData) {
        if (this.useMockData) {
            MOCK_DATABASE.users[userName] = userData;
            saveMockData();
            return userData;
        } else {
            return await firebaseService.saveUser(userName, userData);
        }
    }
    
    // ===== Daily Logs Operations =====
    
    async saveDailyLog(userName, date, logData) {
        if (this.useMockData) {
            return await MockAPI.saveDailyLog(userName, { ...logData, date });
        } else {
            return await firebaseService.saveDailyLog(userName, date, logData);
        }
    }
    
    async getUserDailyLogs(userName, limit = 30) {
        if (this.useMockData) {
            const userData = await MockAPI.getUserData(userName);
            return userData.dailyLogs || {};
        } else {
            return await firebaseService.getUserDailyLogs(userName, limit);
        }
    }
    
    async getAllDailyLogs() {
        if (this.useMockData) {
            const data = await MockAPI.getAllData();
            const allLogs = {};
            Object.entries(data.users).forEach(([userName, userData]) => {
                allLogs[userName] = userData.dailyLogs || {};
            });
            return allLogs;
        } else {
            return await firebaseService.getAllDailyLogs();
        }
    }
    
    async hasLoggedToday(userName, date) {
        if (this.useMockData) {
            const userData = await MockAPI.getUserData(userName);
            return userData.dailyLogs && userData.dailyLogs[date] !== undefined;
        } else {
            return await firebaseService.hasLoggedToday(userName, date);
        }
    }
    
    // ===== Leaderboard & Stats =====
    
    async getLeaderboard() {
        if (this.useMockData) {
            return await MockAPI.getLeaderboard();
        } else {
            return await firebaseService.getLeaderboard();
        }
    }
    
    async getUserStats(userName) {
        if (this.useMockData) {
            return await MockAPI.getUserStats(userName);
        } else {
            return await firebaseService.getUserStats(userName);
        }
    }
    
    // ===== Data Management =====
    
    async exportAllData() {
        if (this.useMockData) {
            return await MockAPI.exportData();
        } else {
            return await firebaseService.exportAllData();
        }
    }
    
    async importData(data) {
        if (this.useMockData) {
            return await MockAPI.importData(data);
        } else {
            return await firebaseService.importData(data);
        }
    }
    
    async resetAllData() {
        if (this.useMockData) {
            return await MockAPI.resetAllData();
        } else {
            return await firebaseService.resetAllData();
        }
    }
    
    // ===== Real-time Updates (Firebase only) =====
    
    subscribeToLeaderboard(callback) {
        if (this.useMockData) {
            // Simulate real-time updates with polling for mock data
            const interval = setInterval(async () => {
                const leaderboard = await MockAPI.getLeaderboard();
                callback(leaderboard);
            }, 5000); // Update every 5 seconds
            
            // Return unsubscribe function
            return () => clearInterval(interval);
        } else {
            return firebaseService.subscribeToLeaderboard(callback);
        }
    }
    
    subscribeToUser(userName, callback) {
        if (this.useMockData) {
            // Simulate real-time updates with polling for mock data
            const interval = setInterval(async () => {
                try {
                    const userData = await MockAPI.getUserData(userName);
                    callback(userData);
                } catch (error) {
                    console.error('Error in user subscription:', error);
                }
            }, 5000); // Update every 5 seconds
            
            // Return unsubscribe function
            return () => clearInterval(interval);
        } else {
            return firebaseService.subscribeToUser(userName, callback);
        }
    }
    
    // ===== Helper Methods =====
    
    // Get today's date string
    getTodayString() {
         const date = new Date();
        date.setDate(date.getDate() + 6); // suma 1 día
        return date.toISOString().split('T')[0];
    }

    getDaysSinceChallengeStart() {
        const start = new Date(AppConfig.APP_SETTINGS.startDate);    
        const today = new Date();                 

        const diffMs = today - start;

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    
    // Get week number
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}-W${weekNo}`;
    }
    
    // Calculate points for activities
    calculatePoints(activities, personalChallenge, dailyBonus = false, weeklyBonus = false) {
        let points = 0;
        const breakdown = [];
        
        Object.entries(activities).forEach(([activity, completed]) => {
            if (activity === personalChallenge && !completed) {
                points -= AppConfig.APP_SETTINGS.penaltyPoints;
                breakdown.push(`${activity}: -${AppConfig.APP_SETTINGS.penaltyPoints} (reto personal)`);
            } else if (completed) {
                points += AppConfig.APP_SETTINGS.pointsPerActivity;
                breakdown.push(`${activity}: +${AppConfig.APP_SETTINGS.pointsPerActivity}`);
            } else {
                points -= AppConfig.APP_SETTINGS.pointsPerActivity;
                breakdown.push(`${activity}: -${AppConfig.APP_SETTINGS.pointsPerActivity}`);
            }
        });
        
        if (dailyBonus) {
            points += AppConfig.APP_SETTINGS.dailyBonusPoints;
            breakdown.push(`Bonus diario: +${AppConfig.APP_SETTINGS.dailyBonusPoints}`);
        }
        
        if (weeklyBonus) {
            points += AppConfig.APP_SETTINGS.weeklyBonusPoints;
            breakdown.push(`Bonus semanal: +${AppConfig.APP_SETTINGS.weeklyBonusPoints}`);
        }
        
        return { points, breakdown };
    }
    
    // Check if week is complete for user
    async isWeekComplete(userName) {
        const logs = await this.getUserDailyLogs(userName, 7);
        const currentWeek = this.getWeekNumber(new Date());
        let daysInWeek = 0;
        
        Object.entries(logs).forEach(([date, log]) => {
            const logWeek = this.getWeekNumber(new Date(date));
            if (logWeek === currentWeek) {
                daysInWeek++;
            }
        });
        
        return daysInWeek >= 7;
    }
    
    // Get weekly progress for user
    async getWeeklyProgress(userName) {
        const logs = await this.getUserDailyLogs(userName, 7);
        const today = new Date();
        const currentWeek = this.getWeekNumber(today);
        const weekDays = [];
        
        // Get Monday of current week
        const monday = new Date(today);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        
        // Check each day of the week
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            
            weekDays.push({
                date: dateString,
                dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
                completed: logs[dateString] !== undefined,
                isToday: dateString === this.getTodayString(),
                isFuture: date > today
            });
        }
        
        return {
            week: currentWeek,
            days: weekDays,
            completedDays: weekDays.filter(d => d.completed).length,
            totalDays: 7,
            isComplete: weekDays.filter(d => d.completed).length >= 7
        };
    }
    
    // Check free passes usage
    async checkFreePasses(userName) {
        const user = await this.getUser(userName);
        const currentWeek = this.getWeekNumber(new Date());
        
        return {
            restDayUsed: user.restDaysUsed && user.restDaysUsed[currentWeek] === true,
            cheatMealUsed: user.cheatMealsUsed && user.cheatMealsUsed[currentWeek] === true,
            week: currentWeek
        };
    }
    
    // Update free pass usage
    async updateFreePass(userName, passType, week) {
        const user = await this.getUser(userName);
        
        if (passType === 'restDay') {
            if (!user.restDaysUsed) user.restDaysUsed = {};
            user.restDaysUsed[week] = true;
        } else if (passType === 'cheatMeal') {
            if (!user.cheatMealsUsed) user.cheatMealsUsed = {};
            user.cheatMealsUsed[week] = true;
        }
        
        return await this.saveUser(userName, user);
    }
}

// Create global data service instance
const dataService = new DataService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = dataService;
}
