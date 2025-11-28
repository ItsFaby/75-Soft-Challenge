// ===== Main App Module =====
class App {
  constructor() {
    this.currentUser = null;
    this.currentTab = 'dashboard';
    this.leaderboardUnsubscribe = null;
    this.userUnsubscribe = null;
    this.initialized = false;
    this.selectedDate = null; // For navigating to previous days (only when ALLOW_EDIT_PREVIOUS_DAYS is true)
  }

  // Initialize the app
  async init() {
    try {
      console.log('Initializing 75 Soft Tracker...');

      // Show loading state
      this.showGlobalLoader();

      // Initialize data service
      await dataService.initialize();

      // Initialize charts
      await chartsManager.initializeCharts();

      // Setup event listeners
      this.setupEventListeners();

      // Setup development tools visibility
      this.setupDevTools();

      // Load initial data
      await this.loadDashboard();

      // Setup real-time updates
      this.setupRealtimeUpdates();

      // Hide loading state
      this.hideGlobalLoader();

      this.initialized = true;
      console.log('App initialized successfully');
    } catch (error) {
      console.error('App initialization error:', error);
      this.hideGlobalLoader();
      this.showToast('Error al inicializar la aplicación', 'error');
    }
  }

  // Setup development tools visibility
  setupDevTools() {
    const devTools = document.getElementById('devTools');
    if (devTools) {
      if (AppConfig.APP_SETTINGS.DEV_MODE) {
        devTools.style.display = 'block';
        // Update offset display
        const offsetDisplay = document.getElementById('devDaysOffset');
        if (offsetDisplay) {
          offsetDisplay.textContent = AppConfig.APP_SETTINGS.DEV_DAYS_OFFSET;
        }
        console.log('🔧 DEV MODE ENABLED - Development tools are visible');
      } else {
        devTools.style.display = 'none';
      }
    }

    // Setup date navigation controls visibility
    const dateNavControls = document.getElementById('dateNavigationControls');
    if (dateNavControls) {
      if (AppConfig.APP_SETTINGS.ALLOW_EDIT_PREVIOUS_DAYS) {
        dateNavControls.style.display = 'block';
        console.log('📅 ALLOW_EDIT_PREVIOUS_DAYS ENABLED - Date navigation controls are visible');
      } else {
        dateNavControls.style.display = 'none';
      }
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach((button) => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // User selector
    const userSelector = document.getElementById('currentUser');
    if (userSelector) {
      userSelector.addEventListener('change', (e) => {
        this.selectUser(e.target.value);
      });
    }

    // Submit daily log
    const submitButton = document.getElementById('submitDaily');
    if (submitButton) {
      submitButton.addEventListener('click', () => {
        this.submitDailyLog();
      });
    }

    // Free passes
    const restDay = document.getElementById('restDay');
    const cheatMeal = document.getElementById('cheatMeal');
    const dessertPass = document.getElementById('dessertPass');
    const sodaPass = document.getElementById('sodaPass');

    if (restDay) {
      restDay.addEventListener('change', (e) => {
        this.handleFreePass('restDay', e.target.checked);
      });
    }

    if (cheatMeal) {
      cheatMeal.addEventListener('change', (e) => {
        this.handleFreePass('cheatMeal', e.target.checked);
      });
    }

    if (dessertPass) {
      dessertPass.addEventListener('change', (e) => {
        this.handleFreePass('dessertPass', e.target.checked);
      });
    }

    if (sodaPass) {
      sodaPass.addEventListener('change', (e) => {
        this.handleFreePass('sodaPass', e.target.checked);
      });
    }

    // Activity checkboxes
    document
      .querySelectorAll('.checklist input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
          this.updatePointsPreview();
        });
      });

    // Late penalty checkbox
    const latePenalty = document.getElementById('latePenalty');
    if (latePenalty) {
      latePenalty.addEventListener('change', () => {
        this.updatePointsPreview();
      });
    }

    // History filters
    const historyUser = document.getElementById('historyUser');
    const historyPeriod = document.getElementById('historyPeriod');

    if (historyUser) {
      historyUser.addEventListener('change', () => {
        this.updateHistory();
      });
    }

    if (historyPeriod) {
      historyPeriod.addEventListener('change', () => {
        this.updateHistory();
      });
    }

    // Date navigation controls (for editing previous days)
    const prevDayBtn = document.getElementById('prevDayBtn');
    const nextDayBtn = document.getElementById('nextDayBtn');
    const resetDateBtn = document.getElementById('resetDateBtn');

    if (prevDayBtn) {
      prevDayBtn.addEventListener('click', () => {
        this.navigateDate(-1);
      });
    }

    if (nextDayBtn) {
      nextDayBtn.addEventListener('click', () => {
        this.navigateDate(1);
      });
    }

    if (resetDateBtn) {
      resetDateBtn.addEventListener('click', () => {
        this.resetSelectedDate();
      });
    }
  }

  // Switch tab
  switchTab(tabName) {
    // Update active states
    document.querySelectorAll('.tab-content').forEach((tab) => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach((button) => {
      button.classList.remove('active');
    });

    // Activate new tab
    const tabContent = document.getElementById(tabName);
    const tabButton = document.querySelector(`[data-tab="${tabName}"]`);

    if (tabContent) tabContent.classList.add('active');
    if (tabButton) tabButton.classList.add('active');

    this.currentTab = tabName;

    // Load tab-specific data
    switch (tabName) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'daily':
        this.loadDailyCheck();
        break;
      case 'analytics':
        this.loadAnalytics();
        break;
      case 'history':
        this.updateHistory();
        break;
    }
  }

  // Load dashboard
  async loadDashboard() {
    try {
      // Update podium
      await this.updatePodium();

      // Update stats
      await this.updateStats();

      // Update streaks
      await this.updateStreaks();
    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.showToast('Error al cargar el dashboard', 'error');
    }
  }

  // Update podium
  async updatePodium() {
    const podium = document.getElementById('podium');
    if (!podium) return;

    const leaderboard = await dataService.getLeaderboard();
    const positions = ['first', 'second', 'third', 'fourth'];
    const medals = ['🥇', '🥈', '🥉', '🏅'];

    podium.innerHTML = '';

    if (leaderboard.length === 0) {
      podium.innerHTML =
        '<p style="text-align: center; color: #666; padding: 20px;">No hay participantes aún. ¡Sé el primero en registrar tu progreso!</p>';
      return;
    }

    leaderboard.slice(0, 4).forEach((user, index) => {
      const div = document.createElement('div');
      div.className = `podium-place ${positions[index]}`;
      div.innerHTML = `
                <span class="medal">${medals[index]}</span>
                <div class="podium-name">${user.name}</div>
                <div class="podium-points">${user.points} pts</div>
            `;
      podium.appendChild(div);
    });
  }

  // Update stats
  async updateStats() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;

    const users = await dataService.getAllUsers();
    const today = dataService.getTodayString();

    // Calculate stats
    let todayCompleted = 0;
    let totalPoints = 0;
    const userCount = Object.keys(users).length;

    for (const userName of Object.keys(users)) {
      const userData = users[userName];
      totalPoints += userData.points || 0;

      const hasLogged = await dataService.hasLoggedToday(userName, today);
      if (hasLogged) todayCompleted++;
    }

    const leaderboard = await dataService.getLeaderboard();
    const leader = leaderboard.length > 0 ? leaderboard[0] : null;

    var challengeDay = dataService.getDaysSinceChallengeStart();

    statsGrid.innerHTML = `
            <div class="stat-card">
                <h3>📅 Días Totales</h3>
                <div class="stat-value">${challengeDay}</div>
                <div class="stat-label">día de competencia</div>
            </div>
            <div class="stat-card">
                <h3>✅ Completados Hoy</h3>
                <div class="stat-value">${todayCompleted}/${userCount}</div>
                <div class="stat-label">participantes</div>
            </div>
            <div class="stat-card">
                <h3>👑 Líder Actual</h3>
                <div class="stat-value">${
                  leader ? leader.name : 'Sin líder'
                }</div>
                <div class="stat-label">${
                  leader ? leader.points + ' puntos' : 'Comienza a participar'
                }</div>
            </div>
            <div class="stat-card">
                <h3>💰 Premio</h3>
                <div class="stat-value">$${
                  AppConfig.APP_SETTINGS.prizeAmount
                }</div>
                <div class="stat-label">para el ganador</div>
            </div>
        `;
  }

  // Update streaks
  async updateStreaks() {
    const streaksGrid = document.getElementById('streaksGrid');
    if (!streaksGrid) return;

    const streaks = await dataService.getAllStreaks();

    if (streaks.length === 0) {
      streaksGrid.innerHTML =
        '<p style="text-align: center; color: #666; padding: 20px;">No hay rachas registradas aún. ¡Comienza tu racha hoy!</p>';
      return;
    }

    // Find the longest streak holder
    const longestStreakHolder = streaks.reduce(
      (max, user) => (user.longestStreak > max.longestStreak ? user : max),
      streaks[0]
    );

    let html = '<div class="streaks-list">';

    streaks.forEach((user, index) => {
      const isLongestStreak =
        user.longestStreak === longestStreakHolder.longestStreak &&
        user.longestStreak > 0;
      const streakClass = isLongestStreak ? 'longest-streak' : '';

      html += `
        <div class="streak-item ${streakClass}">
          <div class="streak-user">
            ${isLongestStreak ? '🏆 ' : ''}
            <strong>${user.userName}</strong>
          </div>
          <div class="streak-stats">
            <div class="streak-current">
              🔥 Racha actual: <strong>${user.currentStreak}</strong> días
            </div>
            <div class="streak-longest">
              ⭐ Racha más larga: <strong>${user.longestStreak}</strong> días
              ${isLongestStreak ? ' 👑' : ''}
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    streaksGrid.innerHTML = html;
  }

  // Load daily check
  async loadDailyCheck() {
    // Update date display - use either selected date or today
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const displayDate = this.getDisplayDateObject();
      const dateStr = displayDate.toLocaleDateString('es-ES', options);
      dateDisplay.textContent = `📅 ${dateStr}`;
    }

    // Update date navigation indicator
    this.updateDateNavigationIndicator();

    // Update daily challenge - GLOBAL (same for everyone)
    // Use the competition day (1-75) to show the correct challenge
    const challengeDay = dataService.getDaysSinceChallengeStart();
    // Array is 0-indexed, so day 1 = index 0
    const dayIndex = challengeDay - 1;
    // Make sure we're within bounds (0-74 for 75 days)
    const challenge = AppConfig.DAILY_CHALLENGES[Math.min(Math.max(dayIndex, 0), 74)];
    const label = document.getElementById('dailyBonusLabel');
    if (label && challenge) {
      label.textContent = challenge.text;
    }

    // Check current user
    if (this.currentUser) {
      await this.checkUserStatus();
    }
  }

  // Select user
  async selectUser(userName) {
    if (!userName) {
      this.currentUser = null;
      this.resetDailyForm();
      return;
    }

    this.currentUser = userName;
    await this.checkUserStatus();
  }

  // Check user status
  async checkUserStatus() {
    if (!this.currentUser) return;

    const userData = AppConfig.USERS[this.currentUser];
    // Use display date instead of always "today"
    const displayDate = this.getDisplayDate();
    console.log(displayDate);

    // Show/hide late penalty section based on whether we're editing a previous day
    const latePenaltySection = document.getElementById('latePenaltySection');
    const latePenaltyCheckbox = document.getElementById('latePenalty');
    const today = dataService.getTodayString();
    const isEditingPreviousDay = displayDate < today;

    if (latePenaltySection) {
      if (AppConfig.APP_SETTINGS.ALLOW_EDIT_PREVIOUS_DAYS && isEditingPreviousDay) {
        latePenaltySection.style.display = 'block';
      } else {
        latePenaltySection.style.display = 'none';
      }
    }

    // Check if already logged for the display date
    const hasLogged = await dataService.hasLoggedToday(this.currentUser, displayDate);
    const submitButton = document.getElementById('submitDaily');
    const checkboxes = document.querySelectorAll(
      '.checklist input[type="checkbox"]'
    );

    if (hasLogged) {
      // User already logged - allow editing
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = '🔄 Actualizar Registro';
      }

      // Load and show logged data for editing
      const logs = await dataService.getUserDailyLogs(this.currentUser, 365);
      const dateLog = logs[displayDate];

      if (dateLog) {
        checkboxes.forEach((cb) => {
          cb.disabled = false; // Allow editing
          cb.checked = dateLog.activities && dateLog.activities[cb.value];
        });

        const dailyBonus = document.getElementById('dailyBonus');
        const restDay = document.getElementById('restDay');
        const cheatMeal = document.getElementById('cheatMeal');
        const dessertPass = document.getElementById('dessertPass');
        const sodaPass = document.getElementById('sodaPass');
        const latePenalty = document.getElementById('latePenalty');

        if (dailyBonus) {
          dailyBonus.checked = dateLog.dailyBonus;
          dailyBonus.disabled = false; // Allow editing
        }
        if (restDay) {
          restDay.checked = dateLog.restDay;
          restDay.disabled = false; // Allow editing
        }
        if (cheatMeal) {
          cheatMeal.checked = dateLog.cheatMeal;
          cheatMeal.disabled = false; // Allow editing
        }
        if (dessertPass) {
          dessertPass.checked = dateLog.dessertPass;
          dessertPass.disabled = false; // Allow editing
        }
        if (sodaPass) {
          sodaPass.checked = dateLog.sodaPass;
          sodaPass.disabled = false; // Allow editing
        }
        if (latePenalty) {
          latePenalty.checked = dateLog.latePenalty || false;
        }
      }

      // Check free passes
      await this.checkFreePasses();

      // Update weekly progress
      await this.updateWeeklyProgress();
    } else {
      // User can log
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Registrar Día Completado 🚀';
      }

      checkboxes.forEach((cb) => {
        cb.disabled = false;
        cb.checked = false;
      });

      // Reset bonus checkboxes
      const dailyBonus = document.getElementById('dailyBonus');
      const weeklyBonus = document.getElementById('weeklyBonus');
      const latePenalty = document.getElementById('latePenalty');

      if (dailyBonus) {
        dailyBonus.checked = false;
        dailyBonus.disabled = false;
      }
      if (weeklyBonus) {
        weeklyBonus.checked = false;
        weeklyBonus.disabled = true; // Will be enabled if week is complete
      }
      if (latePenalty) {
        latePenalty.checked = false;
      }

      // Check free passes
      await this.checkFreePasses();

      // Update weekly progress
      await this.updateWeeklyProgress();
    }

    // Update points preview
    this.updatePointsPreview();
  }

  // Check free passes
  async checkFreePasses() {
    if (!this.currentUser) return;

    console.log(
      `🎫 [UI] Verificando y actualizando pases semanales en la interfaz...`
    );

    const displayDate = this.getDisplayDate();
    const hasLogged = await dataService.hasLoggedToday(this.currentUser, displayDate);
    const passes = await dataService.checkFreePasses(this.currentUser);
    const restDay = document.getElementById('restDay');
    const cheatMeal = document.getElementById('cheatMeal');
    const dessertPass = document.getElementById('dessertPass');
    const sodaPass = document.getElementById('sodaPass');
    const restDayCount = document.getElementById('restDayCount');
    const cheatMealCount = document.getElementById('cheatMealCount');
    const dessertPassCount = document.getElementById('dessertPassCount');
    const sodaPassCount = document.getElementById('sodaPassCount');

    if (restDay) {
      restDay.disabled = passes.restDayUsed;
      // Only keep checked if user already logged today and it was in their log
      if (!hasLogged) {
        restDay.checked = false;
      }
      console.log(
        `   Día de descanso: ${
          passes.restDayUsed ? '❌ Usado' : '✅ Disponible'
        }`
      );
    }
    if (cheatMeal) {
      cheatMeal.disabled = passes.cheatMealUsed;
      // Only keep checked if user already logged today and it was in their log
      if (!hasLogged) {
        cheatMeal.checked = false;
      }
      console.log(
        `   Cheat meal: ${passes.cheatMealUsed ? '❌ Usado' : '✅ Disponible'}`
      );
    }
    if (dessertPass) {
      dessertPass.disabled = passes.dessertPassUsed;
      // Only keep checked if user already logged today and it was in their log
      if (!hasLogged) {
        dessertPass.checked = false;
      }
      console.log(
        `   Postre: ${passes.dessertPassUsed ? '❌ Usado' : '✅ Disponible'}`
      );
    }
    if (sodaPass) {
      sodaPass.disabled = passes.sodaPassUsed;
      // Only keep checked if user already logged today and it was in their log
      if (!hasLogged) {
        sodaPass.checked = false;
      }
      console.log(
        `   Bebida permitida: ${
          passes.sodaPassUsed ? '❌ Usado' : '✅ Disponible'
        }`
      );
    }
    if (restDayCount) {
      restDayCount.textContent = passes.restDayUsed
        ? '✅ Usado esta semana'
        : '1 disponible';
    }
    if (cheatMealCount) {
      cheatMealCount.textContent = passes.cheatMealUsed
        ? '✅ Usado esta semana'
        : '1 disponible';
    }
    if (dessertPassCount) {
      dessertPassCount.textContent = passes.dessertPassUsed
        ? '✅ Usado esta semana'
        : '1 disponible';
    }
    if (sodaPassCount) {
      sodaPassCount.textContent = passes.sodaPassUsed
        ? '✅ Usado esta semana'
        : '1 disponible';
    }
  }

  // Handle free pass
  handleFreePass(type, checked) {
    if (type === 'restDay') {
      const exercise = document.getElementById('exercise');
      const exerciseItem = document.getElementById('exerciseItem');

      if (checked) {
        exercise.checked = true;
        exercise.disabled = true;
        exerciseItem.classList.add('completed');
        document.getElementById('exercisePoints').textContent =
          '🎫 Día de descanso';
      } else {
        exercise.disabled = false;
        exercise.checked = false;
        exerciseItem.classList.remove('completed');
        this.updatePointsPreview();
      }
    } else if (type === 'cheatMeal') {
      const healthyFood = document.getElementById('healthyFood');
      const healthyFoodItem = document.getElementById('healthyFoodItem');

      if (checked) {
        healthyFood.checked = true;
        healthyFood.disabled = true;
        healthyFoodItem.classList.add('completed');
        document.getElementById('healthyFoodPoints').textContent =
          '🍔 Cheat meal';
      } else {
        healthyFood.disabled = false;
        healthyFood.checked = false;
        healthyFoodItem.classList.remove('completed');
        this.updatePointsPreview();
      }
    } else if (type === 'dessertPass') {
      const healthyFood = document.getElementById('healthyFood');
      const healthyFoodItem = document.getElementById('healthyFoodItem');

      if (checked) {
        healthyFood.checked = true;
        healthyFood.disabled = true;
        healthyFoodItem.classList.add('completed');
        document.getElementById('healthyFoodPoints').textContent =
          '🍰 Postre permitido';
      } else {
        healthyFood.disabled = false;
        healthyFood.checked = false;
        healthyFoodItem.classList.remove('completed');
        this.updatePointsPreview();
      }
    } else if (type === 'sodaPass') {
      const noAlcohol = document.getElementById('noAlcohol');
      const noAlcoholItem = document.getElementById('noAlcoholItem');

      if (checked) {
        noAlcohol.checked = true;
        noAlcohol.disabled = true;
        noAlcoholItem.classList.add('completed');
        document.getElementById('noAlcoholPoints').textContent =
          '🥤 Bebida permitida';
      } else {
        noAlcohol.disabled = false;
        noAlcohol.checked = false;
        noAlcoholItem.classList.remove('completed');
        this.updatePointsPreview();
      }
    }

    this.updatePointsPreview();
  }

  // Update points preview
  updatePointsPreview() {
    if (!this.currentUser) return;

    const userData = AppConfig.USERS[this.currentUser];
    const activities = {};

    // Get activity values
    ['exercise', 'healthyFood', 'reading', 'water', 'noAlcohol'].forEach(
      (activity) => {
        const checkbox = document.getElementById(activity);
        activities[activity] = checkbox ? checkbox.checked : false;
      }
    );

    // Calculate points
    const dailyBonus = document.getElementById('dailyBonus')?.checked || false;
    const latePenalty = document.getElementById('latePenalty')?.checked || false;
    const result = dataService.calculatePoints(
      activities,
      userData.personalChallenge,
      dailyBonus,
      false,
      latePenalty
    );

    // Update indicators
    this.updateActivityIndicators(activities, userData.personalChallenge);
  }

  // Update activity indicators
  updateActivityIndicators(activities, personalChallenge) {
    // Reset all
    document.querySelectorAll('.check-item').forEach((item) => {
      item.classList.remove('penalty', 'completed');
    });

    // Update each activity
    Object.entries(activities).forEach(([activity, completed]) => {
      const item = document.querySelector(`[data-activity="${activity}"]`);
      if (!item) return;

      const indicator = item.querySelector('.points-indicator');
      if (!indicator) return;

      if (completed) {
        item.classList.add('completed');
        indicator.textContent = '+1 punto';
        indicator.className = 'points-indicator positive';
      } else if (activity === personalChallenge) {
        item.classList.add('penalty');
        indicator.textContent = '-3 puntos';
        indicator.className = 'points-indicator penalty';
      } else {
        indicator.textContent = '-1 punto';
        indicator.className = 'points-indicator negative';
      }
    });
  }

  // Update weekly progress
  async updateWeeklyProgress() {
    if (!this.currentUser) return;

    console.log(
      `🔄 [UI] Actualizando progreso semanal para ${this.currentUser} en la interfaz...`
    );

    const progress = await dataService.getWeeklyProgress(this.currentUser);
    const container = document.getElementById('weeklyProgress');

    if (container) {
      let html = '<div class="weekly-progress-bar">';
      progress.days.forEach((day) => {
        const classes = ['day-indicator'];
        if (day.completed) classes.push('completed');
        if (day.failed) classes.push('failed');
        if (day.isToday) classes.push('today');
        if (day.isFuture) classes.push('future');

        html += `<div class="${classes.join(' ')}" title="${day.dayName}${
          day.failed ? ' - Fallado' : ''
        }"></div>`;
      });
      html += '</div>';

      // Show status message
      if (progress.isFailed) {
        console.log(
          `❌ [UI] Objetivo semanal perdido (${progress.perfectDays}/7 días perfectos)`
        );
        html += `<small style="color: #dc3545;">❌ Objetivo semanal perdido - Faltó completar un día perfecto (${progress.perfectDays}/7 días perfectos)</small>`;
      } else if (progress.isComplete) {
        console.log(
          `✅ [UI] ¡Semana perfecta completada! (7/7 días perfectos)`
        );
        html += `<small style="color: #28a745;">✅ ¡Semana perfecta completada! +5 puntos al registrar el domingo (7/7 días perfectos)</small>`;
      } else {
        console.log(
          `⏳ [UI] Progreso semanal: ${progress.perfectDays}/7 días perfectos`
        );
        html += `<small>${progress.perfectDays}/7 días perfectos esta semana (Lunes-Domingo, sin contar bonus diario)</small>`;
      }

      container.innerHTML = html;
    }

    // Check if week is complete
    if (progress.isComplete) {
      const weeklyBonus = document.getElementById('weeklyBonus');
      if (weeklyBonus) {
        weeklyBonus.checked = true;
        weeklyBonus.disabled = false; // Allow to check if complete
      }
    } else {
      const weeklyBonus = document.getElementById('weeklyBonus');
      if (weeklyBonus) {
        weeklyBonus.checked = false;
        weeklyBonus.disabled = true; // Disable if not complete
      }
    }
  }

  // Submit daily log
  async submitDailyLog() {
    if (!this.currentUser) {
      this.showToast('Por favor selecciona tu nombre', 'warning');
      return;
    }

    // Use display date instead of always "today"
    const dateToSave = this.getDisplayDate();
    const userData = AppConfig.USERS[this.currentUser];

    // Get form data
    const activities = {};
    ['exercise', 'healthyFood', 'reading', 'water', 'noAlcohol'].forEach(
      (activity) => {
        const checkbox = document.getElementById(activity);
        activities[activity] = checkbox ? checkbox.checked : false;
      }
    );

    const dailyBonus = document.getElementById('dailyBonus')?.checked || false;
    const restDay = document.getElementById('restDay')?.checked || false;
    const cheatMeal = document.getElementById('cheatMeal')?.checked || false;
    const dessertPass = document.getElementById('dessertPass')?.checked || false;
    const sodaPass = document.getElementById('sodaPass')?.checked || false;
    const latePenalty = document.getElementById('latePenalty')?.checked || false;

    // Check if today will complete a perfect week (including today's activities)
    const weeklyBonus = await dataService.isWeekCompleteWithToday(
      this.currentUser,
      activities
    );

    // Calculate points
    const result = dataService.calculatePoints(
      activities,
      userData.personalChallenge,
      dailyBonus,
      weeklyBonus,
      latePenalty
    );

    // Create log data
    const logData = {
      activities: activities,
      dailyBonus: dailyBonus,
      weeklyBonus: weeklyBonus,
      restDay: restDay,
      cheatMeal: cheatMeal,
      dessertPass: dessertPass,
      sodaPass: sodaPass,
      latePenalty: latePenalty,
      pointsEarned: result.points,
      breakdown: result.breakdown,
    };

    try {
      // Save log
      await dataService.saveDailyLog(this.currentUser, dateToSave, logData);

      // Update free passes if used
      const currentWeek = dataService.getWeekNumber(
        dataService.getCostaRicaDate()
      );
      if (restDay) {
        await dataService.updateFreePass(
          this.currentUser,
          'restDay',
          currentWeek
        );
      }
      if (cheatMeal) {
        await dataService.updateFreePass(
          this.currentUser,
          'cheatMeal',
          currentWeek
        );
      }
      if (dessertPass) {
        await dataService.updateFreePass(
          this.currentUser,
          'dessertPass',
          currentWeek
        );
      }
      if (sodaPass) {
        await dataService.updateFreePass(
          this.currentUser,
          'sodaPass',
          currentWeek
        );
      }

      // Show success message
      let message = `✅ ¡Día registrado exitosamente!<br>`;
      message +=
        result.points > 0
          ? `Ganaste ${result.points} puntos 🎉`
          : `Perdiste ${Math.abs(result.points)} puntos 😔`;

      if (weeklyBonus) {
        message +=
          '<br>🎊 ¡Bonus semanal completado! +5 puntos por semana perfecta';
      }

      this.showToast(message, result.points > 0 ? 'success' : 'warning');

      // Reload dashboard data
      await this.loadDashboard();

      // Update user status
      await this.checkUserStatus();
    } catch (error) {
      console.error('Error saving daily log:', error);
      this.showToast('Error al guardar el registro', 'error');
    }
  }

  // Load analytics
  async loadAnalytics() {
    await chartsManager.updateAllCharts();
  }

  // Update history
  async updateHistory() {
    const container = document.getElementById('historyContent');
    if (!container) return;

    const selectedUser = document.getElementById('historyUser')?.value || 'all';
    const period = document.getElementById('historyPeriod')?.value || '7';

    try {
      const allLogs = await dataService.getAllDailyLogs();
      const logs = [];

      // Process logs
      Object.entries(allLogs).forEach(([userName, userLogs]) => {
        if (selectedUser === 'all' || selectedUser === userName) {
          Object.entries(userLogs).forEach(([date, log]) => {
            logs.push({
              userName: userName,
              date: date,
              ...log,
            });
          });
        }
      });

      // Sort by date
      logs.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Filter by period
      const filteredLogs = this.filterLogsByPeriod(logs, period);

      // Generate table
      if (filteredLogs.length === 0) {
        container.innerHTML =
          '<p style="text-align: center; padding: 20px; color: #666;">No hay registros para mostrar</p>';
        return;
      }

      let html = '<table class="history-table"><thead><tr>';
      html +=
        '<th>Fecha</th><th>Usuario</th><th>Puntos</th><th>Actividades</th>';
      html += '</tr></thead><tbody>';

      filteredLogs.forEach((log) => {
        const dateObj = new Date(log.date + 'T12:00:00');
        const formattedDate = dateObj.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          timeZone: 'America/Costa_Rica'
        });

        const pointsClass = log.pointsEarned > 0 ? 'positive' : 'negative';

        html += '<tr>';
        html += `<td>${formattedDate}</td>`;
        html += `<td><strong>${log.userName}</strong></td>`;
        html += `<td><span class="points-badge ${pointsClass}">${
          log.pointsEarned > 0 ? '+' : ''
        }${log.pointsEarned}</span></td>`;
        html += '<td>';

        // Activity badges - show both completed and failed
        if (log.activities) {
          const userConfig = AppConfig.USERS[log.userName];
          const personalChallenge = userConfig
            ? userConfig.personalChallenge
            : null;

          Object.entries(log.activities).forEach(([activity, completed]) => {
            if (completed) {
              html += `<span class="activity-badge success">✅ ${activity}</span>`;
            } else {
              // Show failed activities
              if (activity === personalChallenge) {
                html += `<span class="activity-badge penalty">❌ ${activity} (-3)</span>`;
              } else {
                html += `<span class="activity-badge failed">❌ ${activity} (-1)</span>`;
              }
            }
          });
        }

        if (log.dailyBonus) {
          html += '<span class="activity-badge bonus">⭐ Bonus diario</span>';
        }
        if (log.weeklyBonus) {
          html += '<span class="activity-badge bonus">🎯 Bonus semanal</span>';
        }
        if (log.restDay) {
          html += '<span class="activity-badge pass">😴 Día descanso</span>';
        }
        if (log.cheatMeal) {
          html += '<span class="activity-badge pass">🍔 Cheat meal</span>';
        }
        if (log.dessertPass) {
          html += '<span class="activity-badge pass">🍰 Postre</span>';
        }
        if (log.sodaPass) {
          html +=
            '<span class="activity-badge pass">🥤 Bebida permitida</span>';
        }
        if (log.latePenalty) {
          html +=
            '<span class="activity-badge penalty">⏰ Registro tardío (-3)</span>';
        }

        html += '</td></tr>';
      });

      html += '</tbody></table>';
      container.innerHTML = html;
    } catch (error) {
      console.error('Error loading history:', error);
      container.innerHTML =
        '<p style="text-align: center; color: #dc3545;">Error al cargar el historial</p>';
    }
  }

  // Filter logs by period
  filterLogsByPeriod(logs, period) {
    if (period === 'all') return logs;

    const days = parseInt(period);
    const cutoffDate = dataService.getCostaRicaDate();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return logs.filter((log) => new Date(log.date) >= cutoffDate);
  }

  // Reset daily form
  resetDailyForm() {
    console.log(`🔄 [UI] Reseteando formulario diario...`);

    const checkboxes = document.querySelectorAll(
      '.checklist input[type="checkbox"]'
    );
    checkboxes.forEach((cb) => {
      cb.checked = false;
      cb.disabled = true;
    });

    // Reset bonus checkboxes
    const dailyBonus = document.getElementById('dailyBonus');
    const weeklyBonus = document.getElementById('weeklyBonus');
    const restDay = document.getElementById('restDay');
    const cheatMeal = document.getElementById('cheatMeal');
    const dessertPass = document.getElementById('dessertPass');
    const sodaPass = document.getElementById('sodaPass');

    if (dailyBonus) {
      dailyBonus.checked = false;
      dailyBonus.disabled = true;
    }
    if (weeklyBonus) {
      weeklyBonus.checked = false;
      weeklyBonus.disabled = true;
    }
    if (restDay) {
      restDay.checked = false;
      restDay.disabled = true;
    }
    if (cheatMeal) {
      cheatMeal.checked = false;
      cheatMeal.disabled = true;
    }
    if (dessertPass) {
      dessertPass.checked = false;
      dessertPass.disabled = true;
    }
    if (sodaPass) {
      sodaPass.checked = false;
      sodaPass.disabled = true;
    }

    // Reset pass counters
    const restDayCount = document.getElementById('restDayCount');
    const cheatMealCount = document.getElementById('cheatMealCount');
    const dessertPassCount = document.getElementById('dessertPassCount');
    const sodaPassCount = document.getElementById('sodaPassCount');

    if (restDayCount) restDayCount.textContent = '1 disponible';
    if (cheatMealCount) cheatMealCount.textContent = '1 disponible';
    if (dessertPassCount) dessertPassCount.textContent = '1 disponible';
    if (sodaPassCount) sodaPassCount.textContent = '1 disponible';

    const submitButton = document.getElementById('submitDaily');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Selecciona un usuario';
    }

    console.log(`✅ [UI] Formulario reseteado correctamente`);
  }

  // Setup real-time updates
  setupRealtimeUpdates() {
    // Subscribe to leaderboard updates
    this.leaderboardUnsubscribe = dataService.subscribeToLeaderboard(
      (leaderboard) => {
        if (this.currentTab === 'dashboard') {
          this.updatePodium();
          this.updateStats();
        }
      }
    );
  }

  // Show toast notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Show global loader
  showGlobalLoader() {
    // Add loading class to body
    document.body.classList.add('loading');
  }

  // Hide global loader
  hideGlobalLoader() {
    // Remove loading class from body
    document.body.classList.remove('loading');
  }

  // ===== Development Tools =====

  // Advance or rewind days (for testing)
  advanceDays(days) {
    if (!AppConfig.APP_SETTINGS.DEV_MODE) {
      console.warn(
        'DEV_MODE is disabled. Enable it in config.js to use dev tools.'
      );
      return;
    }

    // Get week before advancing
    const beforeDate = dataService.getTodayDate();
    const weekBefore = dataService.getWeekNumber(beforeDate);

    console.log(`⏭️ [DEV MODE] Avanzando ${days} día(s)...`);
    console.log(`📅 [DEV MODE] Semana antes de avanzar: ${weekBefore}`);

    AppConfig.APP_SETTINGS.DEV_DAYS_OFFSET += days;

    // Get week after advancing
    const afterDate = dataService.getTodayDate();
    const weekAfter = dataService.getWeekNumber(afterDate);

    console.log(`📅 [DEV MODE] Semana después de avanzar: ${weekAfter}`);

    // Check if week changed
    if (weekBefore !== weekAfter) {
      console.log(`🔄 [DEV MODE] ¡CAMBIO DE SEMANA DETECTADO!`);
      console.log(`   Semana anterior: ${weekBefore}`);
      console.log(`   Semana nueva: ${weekAfter}`);
      console.log(
        `   ℹ️ Los pases semanales se resetearán automáticamente al verificar el estado del usuario`
      );
    }

    // Update UI
    const offsetDisplay = document.getElementById('devDaysOffset');
    if (offsetDisplay) {
      offsetDisplay.textContent = AppConfig.APP_SETTINGS.DEV_DAYS_OFFSET;
    }

    let message = `Días avanzados: ${days > 0 ? '+' : ''}${days} (Total: ${
      AppConfig.APP_SETTINGS.DEV_DAYS_OFFSET
    })`;
    if (weekBefore !== weekAfter) {
      message += `<br>🔄 ¡Nueva semana! ${weekBefore} → ${weekAfter}`;
    }

    this.showToast(message, 'info');

    // Reload current view
    this.loadCurrentView();
  }

  // Reset days to today
  resetDays() {
    if (!AppConfig.APP_SETTINGS.DEV_MODE) {
      console.warn(
        'DEV_MODE is disabled. Enable it in config.js to use dev tools.'
      );
      return;
    }

    AppConfig.APP_SETTINGS.DEV_DAYS_OFFSET = 0;

    // Update UI
    const offsetDisplay = document.getElementById('devDaysOffset');
    if (offsetDisplay) {
      offsetDisplay.textContent = '0';
    }

    this.showToast('Fecha reseteada a hoy', 'info');

    // Reload current view
    this.loadCurrentView();
  }

  // Load current view (helper for dev tools)
  async loadCurrentView() {
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab) {
      const tabName = activeTab.dataset.tab;
      switch (tabName) {
        case 'dashboard':
          await this.loadDashboard();
          break;
        case 'daily':
          // Reload the entire daily check to update date, bonus challenge, etc.
          await this.loadDailyCheck();
          break;
        case 'analytics':
          await this.loadAnalytics();
          break;
        case 'history':
          await this.updateHistory();
          break;
      }
    }
  }

  // ===== Date Navigation (for editing previous days) =====

  // Navigate to a different date (only when ALLOW_EDIT_PREVIOUS_DAYS is true)
  navigateDate(days) {
    if (!AppConfig.APP_SETTINGS.ALLOW_EDIT_PREVIOUS_DAYS) {
      console.warn(
        'ALLOW_EDIT_PREVIOUS_DAYS is disabled. Enable it in config.js to edit previous days.'
      );
      this.showToast('Edición de días anteriores deshabilitada', 'warning');
      return;
    }

    // If no date selected, start from today
    if (!this.selectedDate) {
      this.selectedDate = dataService.getTodayString();
    }

    // Parse the current selected date and navigate
    const currentDate = new Date(this.selectedDate + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() + days);

    // Format as YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    this.selectedDate = `${year}-${month}-${day}`;

    console.log(`📅 Navegando a fecha: ${this.selectedDate}`);

    // Update navigation indicator
    this.updateDateNavigationIndicator();

    // Reload daily check with new date
    this.loadDailyCheck();
  }

  // Reset to today's date
  resetSelectedDate() {
    if (!AppConfig.APP_SETTINGS.ALLOW_EDIT_PREVIOUS_DAYS) {
      console.warn(
        'ALLOW_EDIT_PREVIOUS_DAYS is disabled. Enable it in config.js to edit previous days.'
      );
      return;
    }

    this.selectedDate = null;
    console.log('📅 Fecha reseteada a hoy');

    // Update navigation indicator
    this.updateDateNavigationIndicator();

    // Reload daily check
    this.loadDailyCheck();
  }

  // Get the date to display (either selected date or today)
  getDisplayDate() {
    if (this.selectedDate && AppConfig.APP_SETTINGS.ALLOW_EDIT_PREVIOUS_DAYS) {
      return this.selectedDate;
    }
    return dataService.getTodayString();
  }

  // Get the date object to display (either selected date or today)
  getDisplayDateObject() {
    if (this.selectedDate && AppConfig.APP_SETTINGS.ALLOW_EDIT_PREVIOUS_DAYS) {
      // Parse the selected date string (YYYY-MM-DD) and create a date in Costa Rica time
      const [year, month, day] = this.selectedDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date;
    }
    return dataService.getTodayDate();
  }

  // Get the day of week for display date (0-6, Sunday-Saturday)
  getDisplayDayOfWeek() {
    if (this.selectedDate && AppConfig.APP_SETTINGS.ALLOW_EDIT_PREVIOUS_DAYS) {
      const date = this.getDisplayDateObject();
      return date.getDay();
    }
    return dataService.getTodayDayOfWeek();
  }

  // Update the date navigation indicator in the UI
  updateDateNavigationIndicator() {
    const indicator = document.getElementById('dateNavigationIndicator');
    if (!indicator) return;

    if (this.selectedDate && AppConfig.APP_SETTINGS.ALLOW_EDIT_PREVIOUS_DAYS) {
      const today = dataService.getTodayString();
      const daysFromToday = this.calculateDaysDifference(this.selectedDate, today);

      if (daysFromToday === 0) {
        indicator.innerHTML = '📅 <strong>Hoy</strong>';
        indicator.style.color = '#28a745';
      } else if (daysFromToday < 0) {
        indicator.innerHTML = `📅 <strong>${Math.abs(daysFromToday)} día${Math.abs(daysFromToday) > 1 ? 's' : ''} atrás</strong>`;
        indicator.style.color = '#ffc107';
      } else {
        indicator.innerHTML = `📅 <strong>${daysFromToday} día${daysFromToday > 1 ? 's' : ''} en el futuro</strong>`;
        indicator.style.color = '#17a2b8';
      }
    } else {
      indicator.innerHTML = '';
    }
  }

  // Calculate days difference between two dates
  calculateDaysDifference(date1, date2) {
    const d1 = new Date(date1 + 'T00:00:00');
    const d2 = new Date(date2 + 'T00:00:00');
    const diffTime = d2 - d1;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Cleanup
  cleanup() {
    if (this.leaderboardUnsubscribe) {
      this.leaderboardUnsubscribe();
    }
    if (this.userUnsubscribe) {
      this.userUnsubscribe();
    }
  }
}

// Create global app instance
const app = new App();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app.init();
  });
} else {
  app.init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  app.cleanup();
});

// Export for debugging
window.app = app;
