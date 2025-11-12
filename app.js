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
            
            // Update data source indicator
            this.updateDataSourceIndicator();
            
            // Load initial data
            await this.loadDashboard();
            
            // Setup real-time updates
            this.setupRealtimeUpdates();
            
            // Hide loading state
            this.hideGlobalLoader();
            
            this.initialized = true;
            console.log('App initialized successfully');
            
            // Show welcome toast
            this.showToast('¡Bienvenido a 75 Soft Tracker! 💪', 'success');
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.hideGlobalLoader();
            this.showToast('Error al inicializar la aplicación', 'error');
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
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
        
        // Activity checkboxes
        document.querySelectorAll('.checklist input[type="checkbox"]').forEach(checkbox => {
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
        
        // Export history
        const exportButton = document.getElementById('exportHistory');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportHistory();
            });
        }
        
        // Settings
        const useFirebase = document.getElementById('useFirebase');
        if (useFirebase) {
            useFirebase.checked = !AppConfig.USE_MOCK_DATA;
            useFirebase.addEventListener('change', (e) => {
                this.toggleDataSource(e.target.checked);
            });
        }
        
        // Save Firebase config
        const saveConfigButton = document.getElementById('saveFirebaseConfig');
        if (saveConfigButton) {
            saveConfigButton.addEventListener('click', () => {
                this.saveFirebaseConfig();
            });
        }
        
        // Action buttons
        const resetButton = document.getElementById('resetAllData');
        const backupButton = document.getElementById('backupData');
        const restoreButton = document.getElementById('restoreData');
        
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetAllData();
            });
        }
        
        if (backupButton) {
            backupButton.addEventListener('click', () => {
                this.backupData();
            });
        }
        
        if (restoreButton) {
            restoreButton.addEventListener('click', () => {
                this.restoreData();
            });
        }
        
        // Modal close
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }
    }
    
    // Switch tab
    switchTab(tabName) {
        // Update active states
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(button => {
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
            case 'settings':
                this.loadSettings();
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
            
            // Update summary
            await this.updateSummary();
            
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
        const medals = ['🥇', '🥈', '🥉', ''];
        
        podium.innerHTML = '';
        
        leaderboard.slice(0, 4).forEach((user, index) => {
            const div = document.createElement('div');
            div.className = `podium-place ${positions[index]}`;
            div.innerHTML = `
                ${medals[index] ? `<span class="medal">${medals[index]}</span>` : ''}
                <div class="podium-position">${index + 1}°</div>
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
        let totalDays = 0;
        let todayCompleted = 0;
        let totalPoints = 0;
        
        for (const userName of Object.keys(users)) {
            const userData = users[userName];
            totalDays += userData.stats?.totalDays || 0;
            totalPoints += userData.points || 0;
            
            const hasLogged = await dataService.hasLoggedToday(userName, today);
            if (hasLogged) todayCompleted++;
        }
        
        const leaderboard = await dataService.getLeaderboard();
        const leader = leaderboard[0];
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <h3>📅 Días Totales</h3>
                <div class="stat-value">${Math.floor(totalDays / 4)}</div>
                <div class="stat-label">días de competencia</div>
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
    
    // Update summary
    async updateSummary() {
        const summaryGrid = document.getElementById('summaryGrid');
        if (!summaryGrid) return;
        
        const users = await dataService.getAllUsers();
        let html = '';
        
        for (const userName of Object.keys(users)) {
            const stats = await dataService.getUserStats(userName);
            html += `
                <div class="summary-card">
                    <h3>${userName}</h3>
                    <div class="stat-value">${stats.currentStreak}</div>
                    <div class="stat-label">racha actual</div>
                    <div style="margin-top: 10px;">
                        <small>Tasa: ${stats.completionRate}%</small>
                    </div>
                </div>
            `;
        }
        
        summaryGrid.innerHTML = html;
    }
    
    // Load daily check
    async loadDailyCheck() {
        // Update date display
        const dateDisplay = document.getElementById('dateDisplay');
        if (dateDisplay) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const today = new Date().toLocaleDateString('es-ES', options);
            dateDisplay.textContent = `📅 ${today}`;
        }
        
        // Update daily challenge
        const dayIndex = new Date().getDay();
        const challenge = AppConfig.DAILY_CHALLENGES[dayIndex];
        const label = document.getElementById('dailyBonusLabel');
        if (label) {
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
        const today = dataService.getTodayString();
        
        // Show penalty alert
        const penaltyAlert = document.getElementById('penaltyAlert');
        if (penaltyAlert) {
            penaltyAlert.innerHTML = `
                <strong>⚠️ Reto Personal de ${this.currentUser}:</strong>
                ${userData.penaltyDescription}
            `;
            penaltyAlert.classList.add('show');
        }
        
        // Check if already logged today
        const hasLogged = await dataService.hasLoggedToday(this.currentUser, today);
        const submitButton = document.getElementById('submitDaily');
        const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
        
        if (hasLogged) {
            // User already logged
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = '✅ Ya registraste hoy';
            }
            
            // Load and show logged data
            const logs = await dataService.getUserDailyLogs(this.currentUser, 1);
            const todayLog = logs[today];
            
            if (todayLog) {
                checkboxes.forEach(cb => {
                    cb.disabled = true;
                    cb.checked = todayLog.activities && todayLog.activities[cb.value];
                });
                
                const dailyBonus = document.getElementById('dailyBonus');
                const restDay = document.getElementById('restDay');
                const cheatMeal = document.getElementById('cheatMeal');
                
                if (dailyBonus) {
                    dailyBonus.checked = todayLog.dailyBonus;
                    dailyBonus.disabled = true;
                }
                if (restDay) {
                    restDay.checked = todayLog.restDay;
                    restDay.disabled = true;
                }
                if (cheatMeal) {
                    cheatMeal.checked = todayLog.cheatMeal;
                    cheatMeal.disabled = true;
                }
            }
        } else {
            // User can log
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Registrar Día Completado 🚀';
            }
            
            checkboxes.forEach(cb => {
                cb.disabled = false;
                cb.checked = false;
            });
            
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
        const restDayCount = document.getElementById('restDayCount');
        const cheatMealCount = document.getElementById('cheatMealCount');
        
        if (restDay) {
            restDay.disabled = passes.restDayUsed;
            restDay.checked = false;
        }
        if (cheatMeal) {
            cheatMeal.disabled = passes.cheatMealUsed;
            cheatMeal.checked = false;
        }
        if (restDayCount) {
            restDayCount.textContent = passes.restDayUsed ? '✅ Usado' : '1 disponible';
        }
        if (cheatMealCount) {
            cheatMealCount.textContent = passes.cheatMealUsed ? '✅ Usado' : '1 disponible';
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
                document.getElementById('exercisePoints').textContent = '🎫 Día de descanso';
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
                document.getElementById('healthyFoodPoints').textContent = '🍔 Cheat meal';
            } else {
                healthyFood.disabled = false;
                healthyFood.checked = false;
                healthyFoodItem.classList.remove('completed');
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
        ['exercise', 'healthyFood', 'reading', 'water', 'noAlcohol'].forEach(activity => {
            const checkbox = document.getElementById(activity);
            activities[activity] = checkbox ? checkbox.checked : false;
        });
        
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
        document.querySelectorAll('.check-item').forEach(item => {
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
            progress.days.forEach(day => {
                const classes = ['day-indicator'];
                if (day.completed) classes.push('completed');
                if (day.isToday) classes.push('today');
                if (day.isFuture) classes.push('future');
                
                html += `<div class="${classes.join(' ')}" title="${day.dayName}"></div>`;
            });
            html += '</div>';
            html += `<small>${progress.completedDays}/7 días completados esta semana</small>`;
            
            container.innerHTML = html;
        }
        
        // Check if week is complete
        if (progress.isComplete) {
            const weeklyBonus = document.getElementById('weeklyBonus');
            if (weeklyBonus) {
                weeklyBonus.checked = true;
                weeklyBonus.disabled = true;
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
        
        // Get form data
        const activities = {};
        ['exercise', 'healthyFood', 'reading', 'water', 'noAlcohol'].forEach(activity => {
            const checkbox = document.getElementById(activity);
            activities[activity] = checkbox ? checkbox.checked : false;
        });
        
        const dailyBonus = document.getElementById('dailyBonus')?.checked || false;
        const restDay = document.getElementById('restDay')?.checked || false;
        const cheatMeal = document.getElementById('cheatMeal')?.checked || false;
        
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
            pointsEarned: result.points,
            breakdown: result.breakdown
        };
        
        try {
            // Save log
            await dataService.saveDailyLog(this.currentUser, today, logData);
            
            // Update free passes if used
            const currentWeek = dataService.getWeekNumber(new Date());
            if (restDay) {
                await dataService.updateFreePass(this.currentUser, 'restDay', currentWeek);
            }
            if (cheatMeal) {
                await dataService.updateFreePass(this.currentUser, 'cheatMeal', currentWeek);
            }
            
            // Show success message
            let message = `✅ ¡Día registrado exitosamente!<br>`;
            message += result.points > 0 
                ? `Ganaste ${result.points} puntos 🎉`
                : `Perdiste ${Math.abs(result.points)} puntos 😔`;
            
            if (weeklyBonus) {
                message += '<br>🎊 ¡Bonus semanal completado!';
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
                            ...log
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
                container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No hay registros para mostrar</p>';
                return;
            }
            
            let html = '<table class="history-table"><thead><tr>';
            html += '<th>Fecha</th><th>Usuario</th><th>Puntos</th><th>Actividades</th>';
            html += '</tr></thead><tbody>';
            
            filteredLogs.forEach(log => {
                const dateObj = new Date(log.date);
                const formattedDate = dateObj.toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                });
                
                const pointsClass = log.pointsEarned > 0 ? 'positive' : 'negative';
                
                html += '<tr>';
                html += `<td>${formattedDate}</td>`;
                html += `<td><strong>${log.userName}</strong></td>`;
                html += `<td><span class="points-badge ${pointsClass}">${log.pointsEarned > 0 ? '+' : ''}${log.pointsEarned}</span></td>`;
                html += '<td>';
                
                // Activity badges
                if (log.activities) {
                    Object.entries(log.activities).forEach(([activity, completed]) => {
                        if (completed) {
                            html += `<span class="activity-badge">✅ ${activity}</span>`;
                        }
                    });
                }
                
                if (log.dailyBonus) {
                    html += '<span class="activity-badge">⭐ Bonus</span>';
                }
                if (log.weeklyBonus) {
                    html += '<span class="activity-badge">🎯 Semanal</span>';
                }
                
                html += '</td></tr>';
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error loading history:', error);
            container.innerHTML = '<p style="text-align: center; color: #dc3545;">Error al cargar el historial</p>';
        }
    }
    
    // Filter logs by period
    filterLogsByPeriod(logs, period) {
        if (period === 'all') return logs;
        
        const days = parseInt(period);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return logs.filter(log => new Date(log.date) >= cutoffDate);
    }
    
    // Export history
    async exportHistory() {
        try {
            const data = await dataService.exportAllData();
            
            // Convert to CSV
            let csv = 'Fecha,Usuario,Ejercicio,Comida,Lectura,Agua,NoAlcohol,Bonus,Puntos\n';
            
            Object.entries(data.users || {}).forEach(([userName, userData]) => {
                Object.entries(userData.dailyLogs || {}).forEach(([date, log]) => {
                    csv += `${date},${userName},`;
                    csv += `${log.activities?.exercise ? 'Si' : 'No'},`;
                    csv += `${log.activities?.healthyFood ? 'Si' : 'No'},`;
                    csv += `${log.activities?.reading ? 'Si' : 'No'},`;
                    csv += `${log.activities?.water ? 'Si' : 'No'},`;
                    csv += `${log.activities?.noAlcohol ? 'Si' : 'No'},`;
                    csv += `${log.dailyBonus ? 'Si' : 'No'},`;
                    csv += `${log.pointsEarned}\n`;
                });
            });
            
            // Download CSV
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `75soft_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            this.showToast('Datos exportados exitosamente', 'success');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showToast('Error al exportar datos', 'error');
        }
    }
    
    // Load settings
    loadSettings() {
        // Load Firebase config if saved
        const apiKey = document.getElementById('firebaseApiKey');
        const authDomain = document.getElementById('firebaseAuthDomain');
        const projectId = document.getElementById('firebaseProjectId');
        
        if (apiKey) apiKey.value = AppConfig.FIREBASE_CONFIG.apiKey || '';
        if (authDomain) authDomain.value = AppConfig.FIREBASE_CONFIG.authDomain || '';
        if (projectId) projectId.value = AppConfig.FIREBASE_CONFIG.projectId || '';
    }
    
    // Toggle data source
    async toggleDataSource(useFirebase) {
        try {
            this.showGlobalLoader();
            
            await dataService.switchDataSource(!useFirebase);
            
            // Update indicator
            this.updateDataSourceIndicator();
            
            // Reload data
            await this.loadDashboard();
            
            this.hideGlobalLoader();
            
            const source = useFirebase ? 'Firebase' : 'Mock Data';
            this.showToast(`Cambiado a ${source}`, 'success');
            
        } catch (error) {
            console.error('Error switching data source:', error);
            this.showToast('Error al cambiar fuente de datos', 'error');
            this.hideGlobalLoader();
        }
    }
    
    // Save Firebase config
    saveFirebaseConfig() {
        const apiKey = document.getElementById('firebaseApiKey')?.value;
        const authDomain = document.getElementById('firebaseAuthDomain')?.value;
        const projectId = document.getElementById('firebaseProjectId')?.value;
        
        if (!apiKey || !authDomain || !projectId) {
            this.showToast('Por favor completa todos los campos', 'warning');
            return;
        }
        
        AppConfig.FIREBASE_CONFIG.apiKey = apiKey;
        AppConfig.FIREBASE_CONFIG.authDomain = authDomain;
        AppConfig.FIREBASE_CONFIG.projectId = projectId;
        
        if (saveConfig()) {
            this.showToast('Configuración guardada exitosamente', 'success');
        } else {
            this.showToast('Error al guardar configuración', 'error');
        }
    }
    
    // Reset all data
    async resetAllData() {
        const confirmed = await this.showConfirm(
            '⚠️ Resetear Todos los Datos',
            '¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.'
        );
        
        if (!confirmed) return;
        
        try {
            await dataService.resetAllData();
            await this.loadDashboard();
            this.showToast('Datos reseteados exitosamente', 'success');
        } catch (error) {
            console.error('Error resetting data:', error);
            this.showToast('Error al resetear datos', 'error');
        }
    }
    
    // Backup data
    async backupData() {
        try {
            const data = await dataService.exportAllData();
            const json = JSON.stringify(data, null, 2);
            
            const blob = new Blob([json], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `75soft_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showToast('Backup creado exitosamente', 'success');
        } catch (error) {
            console.error('Error creating backup:', error);
            this.showToast('Error al crear backup', 'error');
        }
    }
    
    // Restore data
    async restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                await dataService.importData(data);
                await this.loadDashboard();
                
                this.showToast('Datos restaurados exitosamente', 'success');
            } catch (error) {
                console.error('Error restoring data:', error);
                this.showToast('Error al restaurar datos', 'error');
            }
        };
        
        input.click();
    }
    
    // Reset daily form
    resetDailyForm() {
        const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = false;
            cb.disabled = true;
        });
        
        const submitButton = document.getElementById('submitDaily');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Selecciona un usuario';
        }
        
        const penaltyAlert = document.getElementById('penaltyAlert');
        if (penaltyAlert) {
            penaltyAlert.classList.remove('show');
        }
    }
    
    // Update data source indicator
    updateDataSourceIndicator() {
        const indicator = document.getElementById('dataSourceIndicator');
        if (!indicator) return;
        
        const dot = indicator.querySelector('.indicator-dot');
        const text = indicator.querySelector('.indicator-text');
        
        if (AppConfig.USE_MOCK_DATA) {
            dot.classList.remove('firebase');
            text.textContent = 'Mock Data';
        } else {
            dot.classList.add('firebase');
            text.textContent = 'Firebase';
        }
    }
    
    // Setup real-time updates
    setupRealtimeUpdates() {
        // Subscribe to leaderboard updates
        this.leaderboardUnsubscribe = dataService.subscribeToLeaderboard((leaderboard) => {
            if (this.currentTab === 'dashboard') {
                this.updatePodium();
                this.updateStats();
            }
        });
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
    
    // Show confirm dialog
    showConfirm(title, message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('modal');
            const modalTitle = document.getElementById('modalTitle');
            const modalBody = document.getElementById('modalBody');
            const modalFooter = document.getElementById('modalFooter');
            
            if (!modal) {
                resolve(false);
                return;
            }
            
            modalTitle.textContent = title;
            modalBody.textContent = message;
            modalFooter.innerHTML = `
                <button class="action-button" onclick="app.confirmResponse(false)">Cancelar</button>
                <button class="action-button danger" onclick="app.confirmResponse(true)">Confirmar</button>
            `;
            
            this.confirmResolve = resolve;
            modal.style.display = 'block';
        });
    }
    
    // Confirm response
    confirmResponse(value) {
        if (this.confirmResolve) {
            this.confirmResolve(value);
            this.confirmResolve = null;
        }
        this.closeModal();
    }
    
    // Close modal
    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
        }
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
