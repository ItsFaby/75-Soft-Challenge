// ===== Main App Module =====
class App {
  constructor() {
    this.currentUser = null;
    this.currentTab = 'dashboard';
    this.leaderboardUnsubscribe = null;
    this.userUnsubscribe = null;
    this.initialized = false;
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

    for (const userName of Object.keys(users)) {
      const userData = users[userName];
      totalPoints += userData.points || 0;

      const hasLogged = await dataService.hasLoggedToday(userName, today);
      if (hasLogged) todayCompleted++;
    }

    const leaderboard = await dataService.getLeaderboard();
    const leader = leaderboard[0];

    var challengeDay = dataService.getDaysSinceChallengeStart();

    statsGrid.innerHTML = `
            <div class="stat-card">
                <h3>📅 Días Totales</h3>
                <div class="stat-value">${challengeDay}</div>
                <div class="stat-label">día de competencia</div>
            </div>
            <div class="stat-card">
                <h3>✅ Completados Hoy</h3>
                <div class="stat-value">${todayCompleted}/4</div>
                <div class="stat-label">participantes</div>
            </div>
            <div class="stat-card">
                <h3>👑 Líder Actual</h3>
                <div class="stat-value">${leader.name}</div>
                <div class="stat-label">${leader.points} puntos</div>
            </div>
            <div class="stat-card">
                <h3>💰 Premio</h3>
                <div class="stat-value">$${AppConfig.APP_SETTINGS.prizeAmount}</div>
                <div class="stat-label">para el ganador</div>
            </div>
        `;
  }

  // Update streaks
  async updateStreaks() {
    const streaksGrid = document.getElementById('streaksGrid');
    if (!streaksGrid) return;

    const streaks = await dataService.getAllStreaks();

    // Find the longest streak holder
    const longestStreakHolder = streaks.reduce((max, user) =>
      user.longestStreak > max.longestStreak ? user : max
    , streaks[0]);

    let html = '<div class="streaks-list">';

    streaks.forEach((user, index) => {
      const isLongestStreak = user.longestStreak === longestStreakHolder.longestStreak && user.longestStreak > 0;
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
    // Update date display
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const today = new Date().toLocaleDateString('es-ES', options);
      dateDisplay.textContent = `📅 ${today}`;
    }

    // Update daily challenge - now personalized per user
    if (this.currentUser) {
      const dayIndex = new Date().getDay();
      const userChallenges = AppConfig.DAILY_CHALLENGES[this.currentUser];
      const challenge = userChallenges ? userChallenges[dayIndex] : null;
      const label = document.getElementById('dailyBonusLabel');
      if (label && challenge) {
        label.textContent = challenge.text;
      } else if (label) {
        label.textContent = 'Selecciona tu usuario para ver tu reto personal';
      }
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
    const today = dataService.getTodayString();

    // Check if already logged today
    const hasLogged = await dataService.hasLoggedToday(this.currentUser, today);
    const submitButton = document.getElementById('submitDaily');
    const checkboxes = document.querySelectorAll(
      '.checklist input[type="checkbox"]'
    );

    if (hasLogged) {
      // User already logged - but allow editing
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = '🔄 Actualizar Registro del Día';
      }

      // Load and show logged data but keep editable
      const logs = await dataService.getUserDailyLogs(this.currentUser, 1);
      const todayLog = logs[today];

      if (todayLog) {
        checkboxes.forEach((cb) => {
          cb.disabled = false; // Keep editable
          cb.checked = todayLog.activities && todayLog.activities[cb.value];
        });

        const dailyBonus = document.getElementById('dailyBonus');
        const restDay = document.getElementById('restDay');
        const cheatMeal = document.getElementById('cheatMeal');
        const sodaPass = document.getElementById('sodaPass');

        if (dailyBonus) {
          dailyBonus.checked = todayLog.dailyBonus || false;
          dailyBonus.disabled = false; // Keep editable
        }
        if (restDay) {
          restDay.checked = todayLog.restDay || false;
          restDay.disabled = todayLog.restDay; // Disable only if used
        }
        if (cheatMeal) {
          cheatMeal.checked = todayLog.cheatMeal || false;
          cheatMeal.disabled = todayLog.cheatMeal; // Disable only if used
        }
        if (sodaPass) {
          sodaPass.checked = todayLog.sodaPass || false;
          sodaPass.disabled = todayLog.sodaPass; // Disable only if used
        }
      }

      // Check free passes status
      await this.checkFreePasses();

      // Update weekly progress
      await this.updateWeeklyProgress();
    } else {
      // User can log
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Registrar Día Completado 🚀';
      }

      // Reset all checkboxes
      checkboxes.forEach((cb) => {
        cb.disabled = false;
        cb.checked = false;
      });

      // Reset bonus and passes
      const dailyBonus = document.getElementById('dailyBonus');
      const restDay = document.getElementById('restDay');
      const cheatMeal = document.getElementById('cheatMeal');
      const sodaPass = document.getElementById('sodaPass');

      if (dailyBonus) {
        dailyBonus.checked = false;
        dailyBonus.disabled = false;
      }
      if (restDay) {
        restDay.checked = false;
      }
      if (cheatMeal) {
        cheatMeal.checked = false;
      }
      if (sodaPass) {
        sodaPass.checked = false;
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

    const passes = await dataService.checkFreePasses(this.currentUser);
    const restDay = document.getElementById('restDay');
    const cheatMeal = document.getElementById('cheatMeal');
    const sodaPass = document.getElementById('sodaPass');
    const restDayCount = document.getElementById('restDayCount');
    const cheatMealCount = document.getElementById('cheatMealCount');
    const sodaPassCount = document.getElementById('sodaPassCount');

    if (restDay) {
      restDay.disabled = passes.restDayUsed;
      restDay.checked = false;
    }
    if (cheatMeal) {
      cheatMeal.disabled = passes.cheatMealUsed;
      cheatMeal.checked = false;
    }
    if (sodaPass) {
      sodaPass.disabled = passes.sodaPassUsed;
      sodaPass.checked = false;
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
    const result = dataService.calculatePoints(
      activities,
      userData.personalChallenge,
      dailyBonus,
      false
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
        html += `<small style="color: #dc3545;">❌ Objetivo semanal perdido - Faltó un día (${progress.completedDays}/7)</small>`;
      } else if (progress.isComplete) {
        html += `<small style="color: #28a745;">✅ ¡Semana perfecta completada! (7/7)</small>`;
      } else {
        html += `<small>${progress.completedDays}/7 días completados esta semana (Lunes-Domingo)</small>`;
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

    const today = dataService.getTodayString();
    const userData = AppConfig.USERS[this.currentUser];

    // Check if this is an update or new entry
    const hasLogged = await dataService.hasLoggedToday(this.currentUser, today);
    const isUpdate = hasLogged;

    // Get previous log if updating
    let previousLog = null;
    if (isUpdate) {
      const logs = await dataService.getUserDailyLogs(this.currentUser, 1);
      previousLog = logs[today];
    }

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
    const sodaPass = document.getElementById('sodaPass')?.checked || false;

    // Check weekly bonus
    const weeklyBonus = await dataService.isWeekComplete(this.currentUser);

    // Calculate points
    const result = dataService.calculatePoints(
      activities,
      userData.personalChallenge,
      dailyBonus,
      weeklyBonus
    );

    // Create log data
    const logData = {
      activities: activities,
      dailyBonus: dailyBonus,
      weeklyBonus: weeklyBonus,
      restDay: restDay,
      cheatMeal: cheatMeal,
      sodaPass: sodaPass,
      pointsEarned: result.points,
      breakdown: result.breakdown,
    };

    try {
      // Calculate point difference if updating
      let pointsDifference = result.points;
      if (isUpdate && previousLog) {
        pointsDifference = result.points - previousLog.pointsEarned;
      }

      // Save log (this will update if exists)
      await dataService.saveDailyLog(this.currentUser, today, logData, isUpdate ? pointsDifference : result.points);

      // Update free passes if used (only if not previously used)
      const currentWeek = dataService.getWeekNumber(new Date());
      if (restDay && (!previousLog || !previousLog.restDay)) {
        await dataService.updateFreePass(
          this.currentUser,
          'restDay',
          currentWeek
        );
      }
      if (cheatMeal && (!previousLog || !previousLog.cheatMeal)) {
        await dataService.updateFreePass(
          this.currentUser,
          'cheatMeal',
          currentWeek
        );
      }
      if (sodaPass && (!previousLog || !previousLog.sodaPass)) {
        await dataService.updateFreePass(
          this.currentUser,
          'sodaPass',
          currentWeek
        );
      }

      // Show success message
      let message = isUpdate
        ? `🔄 ¡Registro actualizado!<br>`
        : `✅ ¡Día registrado exitosamente!<br>`;

      if (isUpdate && pointsDifference !== 0) {
        message += pointsDifference > 0
          ? `${pointsDifference > 0 ? '+' : ''}${pointsDifference} puntos (ahora tienes ${result.points} puntos hoy)`
          : `${pointsDifference} puntos (ahora tienes ${result.points} puntos hoy)`;
      } else if (isUpdate) {
        message += `Tienes ${result.points} puntos hoy`;
      } else {
        message += result.points > 0
          ? `Ganaste ${result.points} puntos 🎉`
          : `Perdiste ${Math.abs(result.points)} puntos 😔`;
      }

      if (weeklyBonus) {
        message += '<br>🎊 ¡Bonus semanal completado!';
      }

      this.showToast(message, result.points >= 0 ? 'success' : 'warning');

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
        const dateObj = new Date(log.date);
        const formattedDate = dateObj.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
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
          const personalChallenge = userConfig ? userConfig.personalChallenge : null;

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
        if (log.sodaPass) {
          html += '<span class="activity-badge pass">🥤 Bebida permitida</span>';
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
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return logs.filter((log) => new Date(log.date) >= cutoffDate);
  }

  // Reset daily form
  resetDailyForm() {
    const checkboxes = document.querySelectorAll(
      '.checklist input[type="checkbox"]'
    );
    checkboxes.forEach((cb) => {
      cb.checked = false;
      cb.disabled = true;
    });

    const submitButton = document.getElementById('submitDaily');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Selecciona un usuario';
    }
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
