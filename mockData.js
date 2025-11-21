// ===== Mock Data Generator =====
class MockDataGenerator {
    constructor() {
        this.users = ['Kevin', 'Fabi', 'Vivi', 'Yuli'];
        this.activities = ['exercise', 'healthyFood', 'reading', 'water', 'noAlcohol'];
        this.startDate = new Date('2024-01-01');
        this.currentDate = getCostaRicaDate();
    }
    
    // Generate random boolean with probability
    randomBoolean(probability = 0.7) {
        return Math.random() < probability;
    }
    
    // Generate date string
    getDateString(date) {
        return formatDateString(date);
    }
    
    // Generate mock daily log for a user
    generateDailyLog(userName, date) {
        const activities = {};
        let points = 0;
        const breakdown = [];
        
        // Get user's personal challenge
        const userData = AppConfig.USERS[userName];
        const personalChallenge = userData.personalChallenge;
        
        // Check for free passes (random)
        const restDayUsed = personalChallenge === 'exercise' && this.randomBoolean(0.1);
        const cheatMealUsed = personalChallenge === 'healthyFood' && this.randomBoolean(0.1);
        
        // Generate activity completion
        this.activities.forEach(activity => {
            let completed = this.randomBoolean();
            
            // Apply free passes
            if (activity === 'exercise' && restDayUsed) {
                completed = true;
            }
            if (activity === 'healthyFood' && cheatMealUsed) {
                completed = true;
            }
            
            activities[activity] = completed;
            
            // Calculate points
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
        
        // Daily bonus (random)
        const dailyBonus = this.randomBoolean(0.6);
        if (dailyBonus) {
            points += AppConfig.APP_SETTINGS.dailyBonusPoints;
            breakdown.push(`Bonus diario: +${AppConfig.APP_SETTINGS.dailyBonusPoints}`);
        }
        
        // Weekly bonus (check if completed 7 days in week)
        const weeklyBonus = this.randomBoolean(0.1);
        if (weeklyBonus) {
            points += AppConfig.APP_SETTINGS.weeklyBonusPoints;
            breakdown.push(`Bonus semanal: +${AppConfig.APP_SETTINGS.weeklyBonusPoints}`);
        }
        
        return {
            date: this.getDateString(date),
            activities: activities,
            dailyBonus: dailyBonus,
            weeklyBonus: weeklyBonus,
            restDay: restDayUsed,
            cheatMeal: cheatMealUsed,
            pointsEarned: points,
            breakdown: breakdown,
            timestamp: date.getTime()
        };
    }
    
    // Generate complete mock data
    generateMockData(daysBack = 30) {
        const data = {
            users: {},
            lastUpdate: getCostaRicaDate().toISOString(),
            version: AppConfig.APP_SETTINGS.version
        };

        // Initialize users
        this.users.forEach(userName => {
            data.users[userName] = {
                id: userName.toLowerCase(),
                name: userName,
                points: 0,
                dailyLogs: {},
                weeklyStreaks: {},
                restDaysUsed: {},
                cheatMealsUsed: {},
                joinDate: this.startDate.toISOString(),
                lastActive: null,
                stats: {
                    totalDays: 0,
                    perfectDays: 0,
                    currentStreak: 0,
                    longestStreak: 0
                }
            };
        });

        // Generate daily logs for each user
        for (let i = daysBack; i >= 0; i--) {
            const currentDate = getCostaRicaDate();
            currentDate.setDate(currentDate.getDate() - i);
            
            // Skip some days randomly to make it realistic
            if (Math.random() > 0.85 && i > 0) continue;
            
            this.users.forEach(userName => {
                const userData = data.users[userName];
                const dateString = this.getDateString(currentDate);
                
                // Generate log for this day
                const dailyLog = this.generateDailyLog(userName, currentDate);
                userData.dailyLogs[dateString] = dailyLog;
                
                // Update user stats
                userData.points += dailyLog.pointsEarned;
                userData.stats.totalDays++;
                userData.lastActive = dateString;
                
                // Track perfect days
                const perfectDay = Object.values(dailyLog.activities).every(v => v);
                if (perfectDay) {
                    userData.stats.perfectDays++;
                }
                
                // Track streaks
                if (i === 0 || userData.stats.currentStreak > 0) {
                    userData.stats.currentStreak++;
                    userData.stats.longestStreak = Math.max(
                        userData.stats.longestStreak,
                        userData.stats.currentStreak
                    );
                }
                
                // Track weekly passes
                const weekNumber = this.getWeekNumber(currentDate);
                if (dailyLog.restDay) {
                    userData.restDaysUsed[weekNumber] = true;
                }
                if (dailyLog.cheatMeal) {
                    userData.cheatMealsUsed[weekNumber] = true;
                }
            });
        }
        
        return data;
    }
    
    // Get week number helper
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}-W${weekNo}`;
    }
    
    // Generate real-time updates (simulate new daily log)
    generateTodayLog(userName) {
        const today = getCostaRicaDate();
        return this.generateDailyLog(userName, today);
    }

    // Get leaderboard data
    getLeaderboard(data) {
        return Object.entries(data.users)
            .map(([name, userData]) => ({
                name: name,
                points: userData.points,
                totalDays: userData.stats.totalDays,
                currentStreak: userData.stats.currentStreak,
                lastActive: userData.lastActive,
            }))
            .sort((a, b) => b.points - a.points);
    }

    // Get user statistics
    getUserStats(data, userName) {
        const userData = data.users[userName];
        if (!userData) return null;

        const last7Days = [];
        const today = getCostaRicaDate();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = this.getDateString(date);
            
            last7Days.push({
                date: dateString,
                log: userData.dailyLogs[dateString] || null
            });
        }
        
        return {
            userName: userName,
            totalPoints: userData.points,
            totalDays: userData.stats.totalDays,
            perfectDays: userData.stats.perfectDays,
            currentStreak: userData.stats.currentStreak,
            longestStreak: userData.stats.longestStreak,
            last7Days: last7Days,
            completionRate: userData.stats.totalDays > 0 
                ? Math.round((userData.stats.perfectDays / userData.stats.totalDays) * 100) 
                : 0
        };
    }
}

// Create global mock data instance
const MockData = new MockDataGenerator();

// Generate initial mock data
let MOCK_DATABASE = MockData.generateMockData(30);

// Save mock data to localStorage
function saveMockData() {
    try {
        localStorage.setItem('75soft_mock_data', JSON.stringify(MOCK_DATABASE));
        return true;
    } catch (error) {
        console.error('Error saving mock data:', error);
        return false;
    }
}

// Load mock data from localStorage
function loadMockData() {
    try {
        const saved = localStorage.getItem('75soft_mock_data');
        if (saved) {
            MOCK_DATABASE = JSON.parse(saved);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading mock data:', error);
        return false;
    }
}

// Initialize mock data
if (!loadMockData()) {
    // If no saved data, generate new
    MOCK_DATABASE = MockData.generateMockData(30);
    saveMockData();
}

// Mock data API methods (simulate Firebase API)
const MockAPI = {
    // Get all data
    async getAllData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_DATABASE);
            }, 300); // Simulate network delay
        });
    },
    
    // Get user data
    async getUserData(userName) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const userData = MOCK_DATABASE.users[userName];
                if (userData) {
                    resolve(userData);
                } else {
                    reject(new Error('User not found'));
                }
            }, 200);
        });
    },
    
    // Save daily log
    async saveDailyLog(userName, log) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (!MOCK_DATABASE.users[userName]) {
                        reject(new Error('User not found'));
                        return;
                    }
                    
                    const dateString = log.date || formatDateString(getCostaRicaDate());
                    MOCK_DATABASE.users[userName].dailyLogs[dateString] = log;
                    MOCK_DATABASE.users[userName].points += log.pointsEarned;
                    MOCK_DATABASE.users[userName].lastActive = dateString;
                    MOCK_DATABASE.lastUpdate = getCostaRicaDate().toISOString();
                    
                    saveMockData();
                    resolve(log);
                } catch (error) {
                    reject(error);
                }
            }, 300);
        });
    },
    
    // Get leaderboard
    async getLeaderboard() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MockData.getLeaderboard(MOCK_DATABASE));
            }, 200);
        });
    },
    
    // Get user statistics
    async getUserStats(userName) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const stats = MockData.getUserStats(MOCK_DATABASE, userName);
                if (stats) {
                    resolve(stats);
                } else {
                    reject(new Error('User not found'));
                }
            }, 200);
        });
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MockData, MockAPI, MOCK_DATABASE };
}
