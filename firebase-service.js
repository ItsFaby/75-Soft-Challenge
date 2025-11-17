// ===== Firebase Service Layer =====
class FirebaseService {
    constructor() {
        this.db = null;
        this.auth = null;
        this.initialized = false;
    }
    
    // Initialize Firebase
    async initialize() {
        if (this.initialized) return true;
        
        try {
            // Initialize Firebase app
            if (!firebase.apps.length) {
                firebase.initializeApp(AppConfig.FIREBASE_CONFIG);
            }
            
            // Get Firestore instance
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            // Enable offline persistence
            await this.db.enablePersistence()
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
                    } else if (err.code === 'unimplemented') {
                        console.warn('The current browser does not support offline persistence');
                    }
                });
            
            this.initialized = true;
            console.log('Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
        }
    }
    
    // Collection references
    collections = {
        users: 'users',
        dailyLogs: 'dailyLogs',
    };
    
    // ===== User Operations =====
    
    // Get all users
    async getAllUsers() {
        try {
            const snapshot = await this.db.collection(this.collections.users).get();
            const users = {};
            
            snapshot.forEach(doc => {
                users[doc.id] = { id: doc.id, ...doc.data() };
            });
            
            return users;
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }
    
    // Get single user
    async getUser(userName) {
        try {
            const doc = await this.db.collection(this.collections.users).doc(userName).get();

            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            } else {
                // Return default user structure instead of throwing error
                return {
                    id: userName,
                    name: userName,
                    points: 0,
                    lastActive: null,
                    stats: {
                        totalDays: 0,
                        perfectDays: 0,
                        currentStreak: 0,
                        longestStreak: 0
                    },
                    restDaysUsed: {},
                    cheatMealsUsed: {},
                    sodaPassesUsed: {}
                };
            }
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }
    
    // Create or update user
    async saveUser(userName, userData) {
        try {
            const userRef = this.db.collection(this.collections.users).doc(userName);
            await userRef.set(userData, { merge: true });
            return userData;
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    }
    
    // ===== Daily Logs Operations =====
    
    // Save daily log
    async saveDailyLog(userName, date, logData) {
        try {
            const batch = this.db.batch();

            // Save the daily log
            const logId = `${userName}_${date}`;
            const logRef = this.db.collection(this.collections.dailyLogs).doc(logId);

            // Check if this log already exists (updating same day)
            const existingLogDoc = await logRef.get();
            const isUpdate = existingLogDoc.exists;
            const previousLogData = isUpdate ? existingLogDoc.data() : null;

            batch.set(logRef, {
                ...logData,
                userName: userName,
                date: date,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Check if user exists first
            const userRef = this.db.collection(this.collections.users).doc(userName);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                // Create user if doesn't exist
                batch.set(userRef, {
                    name: userName,
                    points: logData.pointsEarned,
                    lastActive: date,
                    stats: {
                        totalDays: 1,
                        perfectDays: Object.values(logData.activities).every(v => v) ? 1 : 0,
                        currentStreak: 0,
                        longestStreak: 0
                    },
                    restDaysUsed: {},
                    cheatMealsUsed: {},
                    sodaPassesUsed: {}
                });
            } else {
                // Calculate the point difference
                let pointsDifference = logData.pointsEarned;
                let totalDaysIncrement = 1;
                let perfectDaysIncrement = 0;

                if (isUpdate && previousLogData) {
                    // If updating, only increment the difference
                    pointsDifference = logData.pointsEarned - (previousLogData.pointsEarned || 0);
                    totalDaysIncrement = 0; // Don't increment totalDays again

                    // Calculate perfect days difference
                    const wasPerfect = previousLogData.activities && Object.values(previousLogData.activities).every(v => v);
                    const isPerfect = Object.values(logData.activities).every(v => v);

                    if (isPerfect && !wasPerfect) {
                        perfectDaysIncrement = 1;
                    } else if (!isPerfect && wasPerfect) {
                        perfectDaysIncrement = -1;
                    }
                } else {
                    // New entry
                    const isPerfect = Object.values(logData.activities).every(v => v);
                    if (isPerfect) {
                        perfectDaysIncrement = 1;
                    }
                }

                // Update user with calculated differences
                const updateData = {
                    lastActive: date
                };

                if (pointsDifference !== 0) {
                    updateData.points = firebase.firestore.FieldValue.increment(pointsDifference);
                }

                if (totalDaysIncrement !== 0) {
                    updateData['stats.totalDays'] = firebase.firestore.FieldValue.increment(totalDaysIncrement);
                }

                if (perfectDaysIncrement !== 0) {
                    updateData['stats.perfectDays'] = firebase.firestore.FieldValue.increment(perfectDaysIncrement);
                }

                batch.set(userRef, updateData, { merge: true });
            }

            await batch.commit();
            return logData;
        } catch (error) {
            console.error('Error saving daily log:', error);
            throw error;
        }
    }
    
    // Get daily logs for a user
    async getUserDailyLogs(userName, limit = 30) {
        try {
            const snapshot = await this.db.collection(this.collections.dailyLogs)
                .where('userName', '==', userName)
                .orderBy('date', 'desc')
                .limit(limit)
                .get();
            
            const logs = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                logs[data.date] = data;
            });
            
            return logs;
        } catch (error) {
            console.error('Error getting daily logs:', error);
            throw error;
        }
    }
    
    // Get all daily logs
    async getAllDailyLogs() {
        try {
            const snapshot = await this.db.collection(this.collections.dailyLogs)
                .orderBy('date', 'desc')
                .get();
            
            const logs = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                if (!logs[data.userName]) {
                    logs[data.userName] = {};
                }
                logs[data.userName][data.date] = data;
            });
            
            return logs;
        } catch (error) {
            console.error('Error getting all daily logs:', error);
            throw error;
        }
    }
    
    // Check if user has logged today
    async hasLoggedToday(userName, date) {
        try {
            const logId = `${userName}_${date}`;
            const doc = await this.db.collection(this.collections.dailyLogs).doc(logId).get();
            return doc.exists;
        } catch (error) {
            console.error('Error checking daily log:', error);
            throw error;
        }
    }
    
    // ===== Leaderboard & Stats =====
    
    // Get leaderboard
    async getLeaderboard() {
        try {
            const snapshot = await this.db.collection(this.collections.users)
                .orderBy('points', 'desc')
                .get();
            
            const leaderboard = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                leaderboard.push({
                    name: doc.id,
                    points: data.points || 0,
                    totalDays: data.stats?.totalDays || 0,
                    currentStreak: data.stats?.currentStreak || 0,
                    lastActive: data.lastActive || null
                });
            });
            
            return leaderboard;
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            throw error;
        }
    }
    
    // Get user statistics
    async getUserStats(userName) {
        try {
            const user = await this.getUser(userName);
            const logs = await this.getUserDailyLogs(userName, 7);
            
            // Calculate last 7 days
            const last7Days = [];
            const today = new Date();
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                
                last7Days.push({
                    date: dateString,
                    log: logs[dateString] || null
                });
            }
            
            return {
                userName: userName,
                totalPoints: user.points || 0,
                totalDays: user.stats?.totalDays || 0,
                perfectDays: user.stats?.perfectDays || 0,
                currentStreak: user.stats?.currentStreak || 0,
                longestStreak: user.stats?.longestStreak || 0,
                last7Days: last7Days,
                completionRate: user.stats?.totalDays > 0 
                    ? Math.round((user.stats?.perfectDays / user.stats?.totalDays) * 100) 
                    : 0
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }
    
    // ===== Real-time Updates =====
    
    // Subscribe to leaderboard updates
    subscribeToLeaderboard(callback) {
        return this.db.collection(this.collections.users)
            .orderBy('points', 'desc')
            .onSnapshot((snapshot) => {
                const leaderboard = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    leaderboard.push({
                        name: doc.id,
                        points: data.points || 0,
                        totalDays: data.stats?.totalDays || 0,
                        currentStreak: data.stats?.currentStreak || 0,
                        lastActive: data.lastActive || null
                    });
                });
                callback(leaderboard);
            });
    }
    
    // Subscribe to user updates
    subscribeToUser(userName, callback) {
        return this.db.collection(this.collections.users)
            .doc(userName)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    callback({ id: doc.id, ...doc.data() });
                }
            });
    }
}

// Create global Firebase service instance
const firebaseService = new FirebaseService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseService;
}
