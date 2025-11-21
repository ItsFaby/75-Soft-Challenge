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
        this.initialized = true;
      } else {
        console.log('Using Firebase');
        await firebaseService.initialize();

        // Initialize users from config if database is empty
        await this.initializeUsersIfNeeded();

        this.initialized = true;
      }

      return true;
    } catch (error) {
      console.error('Data service initialization error:', error);
      console.log('Falling back to Mock Data');
      this.useMockData = true;
      this.initialized = true;
      return true;
    }
  }

  // Initialize users from config if they don't exist
  async initializeUsersIfNeeded() {
    try {
      const existingUsers = await this.getAllUsers();
      const existingUserNames = Object.keys(existingUsers);

      // Get users from config
      const configUserNames = Object.keys(AppConfig.USERS);

      // Check which users need to be initialized
      const usersToCreate = configUserNames.filter(
        (userName) => !existingUserNames.includes(userName)
      );

      if (usersToCreate.length > 0) {
        console.log(
          `Initializing ${usersToCreate.length} users from config:`,
          usersToCreate
        );

        for (const userName of usersToCreate) {
          const defaultUserData = {
            name: userName,
            points: 0,
            lastActive: null,
            stats: {
              totalDays: 0,
              perfectDays: 0,
              currentStreak: 0,
              longestStreak: 0,
            },
            restDaysUsed: {},
            cheatMealsUsed: {},
            sodaPassesUsed: {},
          };

          await this.saveUser(userName, defaultUserData);
        }

        console.log('Users initialized successfully');
      } else {
        console.log('All users from config already exist in database');
      }
    } catch (error) {
      console.error('Error initializing users:', error);
      // Don't throw error, just log it - app should still work
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

  // Get current date in Costa Rica timezone (UTC-6)
  getCostaRicaDate() {
    const daysOffset =
      (AppConfig.APP_SETTINGS.DEV_MODE &&
        AppConfig.APP_SETTINGS.DEV_DAYS_OFFSET) ||
      0;

    if (daysOffset !== 0) {
      console.log(`🔧 DEV MODE: Date offset by ${daysOffset} days`);
    }

    return getCostaRicaDate(daysOffset);
  }

  // Get today's date string
  getTodayString() {
    const date = this.getCostaRicaDate();
    // Use formatDateString to avoid UTC conversion issues
    return formatDateString(date);
  }

  // Get today's Date object (with development offset applied)
  getTodayDate() {
    return this.getCostaRicaDate();
  }

  // Get day of week for today (0-6, with development offset applied)
  getTodayDayOfWeek() {
    return this.getTodayDate().getDay();
  }

  getDaysSinceChallengeStart() {
    const start = new Date(AppConfig.APP_SETTINGS.startDate);
    const today = this.getCostaRicaDate();

    const diffMs = today - start;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays + 1;
  }

  // Get week number
  getWeekNumber(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
  }

  // Calculate points for activities
  calculatePoints(
    activities,
    personalChallenge,
    dailyBonus = false,
    weeklyBonus = false
  ) {
    let points = 0;
    const breakdown = [];

    Object.entries(activities).forEach(([activity, completed]) => {
      if (activity === personalChallenge && !completed) {
        points -= AppConfig.APP_SETTINGS.penaltyPoints;
        breakdown.push(
          `${activity}: -${AppConfig.APP_SETTINGS.penaltyPoints} (reto personal)`
        );
      } else if (completed) {
        points += AppConfig.APP_SETTINGS.pointsPerActivity;
        breakdown.push(
          `${activity}: +${AppConfig.APP_SETTINGS.pointsPerActivity}`
        );
      } else {
        points -= AppConfig.APP_SETTINGS.pointsPerActivity;
        breakdown.push(
          `${activity}: -${AppConfig.APP_SETTINGS.pointsPerActivity}`
        );
      }
    });

    if (dailyBonus) {
      points += AppConfig.APP_SETTINGS.dailyBonusPoints;
      breakdown.push(
        `Bonus diario: +${AppConfig.APP_SETTINGS.dailyBonusPoints}`
      );
    }

    if (weeklyBonus) {
      points += AppConfig.APP_SETTINGS.weeklyBonusPoints;
      breakdown.push(
        `Bonus semanal: +${AppConfig.APP_SETTINGS.weeklyBonusPoints}`
      );
    }

    return { points, breakdown };
  }

  // Check if week is complete for user (all 7 days perfect)
  async isWeekComplete(userName) {
    const progress = await this.getWeeklyProgress(userName);
    // Week is complete only if all 7 days are perfect
    return progress.isComplete && progress.perfectDays === 7;
  }

  // Check if week will be complete with today's activities (used when submitting daily log)
  async isWeekCompleteWithToday(userName, todayActivities) {
    const progress = await this.getWeeklyProgress(userName);
    const today = this.getTodayString();

    // Check if all today's activities are completed (perfect day)
    const isTodayPerfect = Object.values(todayActivities).every(
      (v) => v === true
    );

    if (!isTodayPerfect) {
      return false; // If today is not perfect, can't complete the week
    }

    // Count perfect days excluding today (in case we're updating an existing log)
    let perfectDaysExcludingToday = 0;
    for (const day of progress.days) {
      if (day.date !== today && day.perfect) {
        perfectDaysExcludingToday++;
      }
    }

    // Week is complete if we have 6 perfect days already + today's perfect day = 7
    return perfectDaysExcludingToday === 6;
  }

  // Calculate user streaks (only count perfect days - all base activities completed)
  async calculateUserStreak(userName) {
    const logs = await this.getUserDailyLogs(userName, 100); // Get many days

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Helper function to check if a day is perfect
    const isPerfectDay = (dayLog) => {
      if (!dayLog || !dayLog.activities) return false;
      return Object.values(dayLog.activities).every((v) => v === true);
    };

    // Calculate current streak (from today backwards)
    const today = this.getTodayString();
    const todayDate = new Date(today);

    for (let i = 0; i < 100; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateString = formatDateString(checkDate);
      const dayLog = logs[dateString];

      if (isPerfectDay(dayLog)) {
        currentStreak++;
      } else {
        // Break streak if day is not perfect OR if it's today/future (not yet completed)
        break;
      }
    }

    // Calculate longest streak
    const allDates = Object.keys(logs).sort();
    if (allDates.length > 0) {
      const startDate = new Date(allDates[0]);
      const endDate = new Date(allDates[allDates.length - 1]);
      const totalDays =
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      tempStreak = 0;
      for (let i = 0; i < totalDays; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + i);
        const dateString = formatDateString(checkDate);
        const dayLog = logs[dateString];

        if (isPerfectDay(dayLog)) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        } else {
          tempStreak = 0;
        }
      }
    }

    return {
      currentStreak: currentStreak,
      longestStreak: longestStreak,
    };
  }

  // Get all users streaks
  async getAllStreaks() {
    const users = await this.getAllUsers();
    const streaks = [];

    for (const userName of Object.keys(users)) {
      const streak = await this.calculateUserStreak(userName);
      streaks.push({
        userName: userName,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
      });
    }

    // Sort by longest streak
    streaks.sort((a, b) => b.longestStreak - a.longestStreak);

    return streaks;
  }

  // Get weekly progress for user
  async getWeeklyProgress(userName) {
    console.log(`📈 [TRACKING] Calculando progreso semanal para ${userName}`);

    const logs = await this.getUserDailyLogs(userName, 30); // Get more days to be sure
    const today = this.getCostaRicaDate();
    const currentWeek = this.getWeekNumber(today);
    const weekDays = [];

    console.log(`📅 [TRACKING] Semana actual: ${currentWeek}`);

    // Get Monday of current week
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);

    // Check each day of the week (Monday to Sunday)
    let hasFailedDay = false;
    let perfectDaysCount = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateString = formatDateString(date);
      const dayLog = logs[dateString];
      const isFuture = date > today;
      const isPast = date < today && dateString !== this.getTodayString();

      // Check if day is perfect (all base activities completed, ignoring dailyBonus)
      let isPerfectDay = false;
      if (dayLog && dayLog.activities) {
        isPerfectDay = Object.values(dayLog.activities).every(
          (v) => v === true
        );
      }

      const isCompleted = dayLog !== undefined;

      // A day is failed ONLY if:
      // 1. It's a past day (not today or future)
      // 2. It was completed (has a log)
      // 3. It was NOT perfect
      const isFailed = isPast && isCompleted && !isPerfectDay;

      if (isFailed) {
        hasFailedDay = true;
      }

      if (isPerfectDay) {
        perfectDaysCount++;
      }

      weekDays.push({
        date: dateString,
        dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        completed: isCompleted,
        perfect: isPerfectDay,
        isToday: dateString === this.getTodayString(),
        isFuture: isFuture,
        failed: isFailed,
      });
    }

    const completedDays = weekDays.filter((d) => d.completed).length;
    const pastDays = weekDays.filter((d) => !d.isFuture).length;

    // Week is complete only if all 7 days are perfect AND no day was failed
    const isComplete = perfectDaysCount === 7 && !hasFailedDay;
    const isFailed = hasFailedDay;

    console.log(`📊 [TRACKING] Progreso semanal:`, {
      completedDays: `${completedDays}/7`,
      perfectDays: `${perfectDaysCount}/7`,
      pastDays: `${pastDays}/7`,
      isComplete: isComplete ? '✅ Semana completa' : '⏳ En progreso',
      isFailed: isFailed ? '❌ Semana fallada' : '✅ Sin fallos',
    });

    return {
      week: currentWeek,
      days: weekDays,
      completedDays: completedDays,
      perfectDays: perfectDaysCount,
      totalDays: 7,
      pastDays: pastDays,
      isComplete: isComplete,
      isFailed: isFailed,
      hasFailedDay: hasFailedDay,
    };
  }

  // Check free passes usage
  async checkFreePasses(userName) {
    const user = await this.getUser(userName);
    const currentWeek = this.getWeekNumber(this.getCostaRicaDate());

    console.log(`📊 [TRACKING] Verificando pases semanales para ${userName}`);
    console.log(`📅 [TRACKING] Semana actual: ${currentWeek}`);

    // Reset old weekly passes (cleanup old weeks to save memory and avoid confusion)
    let passesResetted = false;

    if (user.restDaysUsed) {
      const oldWeeks = Object.keys(user.restDaysUsed).filter(
        (week) => week !== currentWeek
      );
      if (oldWeeks.length > 0) {
        console.log(
          `🧹 [TRACKING] Limpiando pases de descanso de semanas anteriores: ${oldWeeks.join(
            ', '
          )}`
        );
        oldWeeks.forEach((week) => delete user.restDaysUsed[week]);
        passesResetted = true;
      }
    }

    if (user.cheatMealsUsed) {
      const oldWeeks = Object.keys(user.cheatMealsUsed).filter(
        (week) => week !== currentWeek
      );
      if (oldWeeks.length > 0) {
        console.log(
          `🧹 [TRACKING] Limpiando pases de cheat meal de semanas anteriores: ${oldWeeks.join(
            ', '
          )}`
        );
        oldWeeks.forEach((week) => delete user.cheatMealsUsed[week]);
        passesResetted = true;
      }
    }

    if (user.sodaPassesUsed) {
      const oldWeeks = Object.keys(user.sodaPassesUsed).filter(
        (week) => week !== currentWeek
      );
      if (oldWeeks.length > 0) {
        console.log(
          `🧹 [TRACKING] Limpiando pases de bebida de semanas anteriores: ${oldWeeks.join(
            ', '
          )}`
        );
        oldWeeks.forEach((week) => delete user.sodaPassesUsed[week]);
        passesResetted = true;
      }
    }

    // Save user if passes were resetted
    if (passesResetted) {
      await this.saveUser(userName, user);
      console.log(
        `✅ [TRACKING] Pases de semanas anteriores limpiados y guardados`
      );
    }

    const result = {
      restDayUsed: user.restDaysUsed && user.restDaysUsed[currentWeek] === true,
      cheatMealUsed:
        user.cheatMealsUsed && user.cheatMealsUsed[currentWeek] === true,
      sodaPassUsed:
        user.sodaPassesUsed && user.sodaPassesUsed[currentWeek] === true,
      week: currentWeek,
    };

    console.log(`📋 [TRACKING] Estado de pases para semana ${currentWeek}:`, {
      restDay: result.restDayUsed ? '❌ Usado' : '✅ Disponible',
      cheatMeal: result.cheatMealUsed ? '❌ Usado' : '✅ Disponible',
      sodaPass: result.sodaPassUsed ? '❌ Usado' : '✅ Disponible',
    });

    return result;
  }

  // Update free pass usage
  async updateFreePass(userName, passType, week) {
    const user = await this.getUser(userName);

    console.log(
      `🎫 [TRACKING] Marcando pase como usado: ${passType} para ${userName} en semana ${week}`
    );

    if (passType === 'restDay') {
      if (!user.restDaysUsed) user.restDaysUsed = {};
      user.restDaysUsed[week] = true;
      console.log(
        `✅ [TRACKING] Día de descanso marcado como usado en semana ${week}`
      );
    } else if (passType === 'cheatMeal') {
      if (!user.cheatMealsUsed) user.cheatMealsUsed = {};
      user.cheatMealsUsed[week] = true;
      console.log(
        `✅ [TRACKING] Cheat meal marcado como usado en semana ${week}`
      );
    } else if (passType === 'sodaPass') {
      if (!user.sodaPassesUsed) user.sodaPassesUsed = {};
      user.sodaPassesUsed[week] = true;
      console.log(
        `✅ [TRACKING] Bebida permitida marcada como usada en semana ${week}`
      );
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
