// ===== Charts Module =====
class ChartsManager {
    constructor() {
        this.charts = {};
        this.colors = {
            Kevin: 'rgba(255, 99, 132, 1)',
            Fabi: 'rgba(54, 162, 235, 1)',
            Vivi: 'rgba(255, 206, 86, 1)',
            Yuli: 'rgba(75, 192, 192, 1)'
        };
        this.initialized = false;
    }
    
    // Initialize all charts
    async initializeCharts() {
        if (this.initialized) return;
        
        // Wait for DOM to be ready
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
            });
        }
        
        this.initialized = true;
    }
    
    // Destroy all existing charts
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
    
    // Category Performance Chart (Radar)
    async createCategoryChart(data) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.category) {
            this.charts.category.destroy();
        }
        
        const categories = ['Ejercicio', 'Comida', 'Lectura', 'Agua', 'No Alcohol'];
        const datasets = [];
        
        Object.entries(data).forEach(([userName, logs]) => {
            const counts = [0, 0, 0, 0, 0];
            
            Object.values(logs).forEach(log => {
                if (log.activities) {
                    if (log.activities.exercise || log.restDay) counts[0]++;
                    if (log.activities.healthyFood || log.cheatMeal) counts[1]++;
                    if (log.activities.reading) counts[2]++;
                    if (log.activities.water) counts[3]++;
                    if (log.activities.noAlcohol) counts[4]++;
                }
            });
            
            datasets.push({
                label: userName,
                data: counts,
                backgroundColor: this.colors[userName].replace('1)', '0.2)'),
                borderColor: this.colors[userName],
                borderWidth: 2,
                pointBackgroundColor: this.colors[userName],
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: this.colors[userName]
            });
        });
        
        this.charts.category = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: categories,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.r} días`;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }
    
    // Progress Chart (Line)
    async createProgressChart(data) {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.progress) {
            this.charts.progress.destroy();
        }
        
        const labels = [];
        const datasets = [];
        
        // Generate last 7 days labels
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));
        }
        
        // Process each user's data
        Object.entries(data).forEach(([userName, userData]) => {
            const points = [];
            let accumulated = 0;
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                
                if (userData.dailyLogs && userData.dailyLogs[dateString]) {
                    accumulated += userData.dailyLogs[dateString].pointsEarned || 0;
                }
                points.push(accumulated);
            }
            
            datasets.push({
                label: userName,
                data: points,
                borderColor: this.colors[userName],
                backgroundColor: this.colors[userName].replace('1)', '0.1)'),
                tension: 0.2,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2
            });
        });
        
        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} puntos`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5,
                            font: { size: 11 }
                        },
                        title: {
                            display: true,
                            text: 'Puntos Acumulados',
                            font: { size: 12 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }
    
    // Activity Chart (Bar)
    async createActivityChart(data) {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.activity) {
            this.charts.activity.destroy();
        }
        
        const activities = ['Ejercicio', 'Comida', 'Lectura', 'Agua', 'No Alcohol', 'Bonus'];
        const datasets = [];
        
        Object.entries(data).forEach(([userName, userData]) => {
            const counts = [0, 0, 0, 0, 0, 0];
            
            // Count last 7 days
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                
                if (userData.dailyLogs && userData.dailyLogs[dateString]) {
                    const log = userData.dailyLogs[dateString];
                    if (log.activities) {
                        if (log.activities.exercise || log.restDay) counts[0]++;
                        if (log.activities.healthyFood || log.cheatMeal) counts[1]++;
                        if (log.activities.reading) counts[2]++;
                        if (log.activities.water) counts[3]++;
                        if (log.activities.noAlcohol) counts[4]++;
                    }
                    if (log.dailyBonus) counts[5]++;
                }
            }
            
            datasets.push({
                label: userName,
                data: counts,
                backgroundColor: this.colors[userName].replace('1)', '0.7)'),
                borderColor: this.colors[userName],
                borderWidth: 2
            });
        });
        
        this.charts.activity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: activities,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} de 7 días`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 7,
                        ticks: {
                            stepSize: 1,
                            font: { size: 11 }
                        },
                        title: {
                            display: true,
                            text: 'Días completados (últimos 7 días)',
                            font: { size: 12 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }
    
    // Monthly Trend Chart
    async createMonthlyChart(data) {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }
        
        // Get last 30 days of data
        const labels = [];
        const datasets = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.getDate());
        }
        
        Object.entries(data).forEach(([userName, userData]) => {
            const dailyPoints = [];
            
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                
                let points = 0;
                if (userData.dailyLogs && userData.dailyLogs[dateString]) {
                    points = userData.dailyLogs[dateString].pointsEarned || 0;
                }
                dailyPoints.push(points);
            }
            
            datasets.push({
                label: userName,
                data: dailyPoints,
                borderColor: this.colors[userName],
                backgroundColor: this.colors[userName].replace('1)', '0.1)'),
                tension: 0.3,
                fill: true,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderWidth: 2
            });
        });
        
        this.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                const date = new Date();
                                date.setDate(date.getDate() - (29 - tooltipItems[0].dataIndex));
                                return date.toLocaleDateString('es-ES', { 
                                    weekday: 'short', 
                                    day: 'numeric', 
                                    month: 'short' 
                                });
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                const label = context.dataset.label;
                                if (value > 0) {
                                    return `${label}: +${value} puntos`;
                                } else if (value < 0) {
                                    return `${label}: ${value} puntos`;
                                } else {
                                    return `${label}: Sin registro`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            stepSize: 2,
                            font: { size: 11 }
                        },
                        title: {
                            display: true,
                            text: 'Puntos por Día',
                            font: { size: 12 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 10 },
                            maxRotation: 0,
                            callback: function(value, index) {
                                // Only show every 5th day
                                return index % 5 === 0 ? value : '';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Día del Mes',
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }
    
    // Update all charts
    async updateAllCharts() {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Get all users data
            const users = await dataService.getAllUsers();
            
            // Get all daily logs
            const allLogs = {};
            for (const userName of Object.keys(users)) {
                const logs = await dataService.getUserDailyLogs(userName, 30);
                allLogs[userName] = logs;
            }
            
            // Combine data
            const fullData = {};
            Object.entries(users).forEach(([userName, userData]) => {
                fullData[userName] = {
                    ...userData,
                    dailyLogs: allLogs[userName] || {}
                };
            });
            
            // Create/update charts
            await this.createCategoryChart(allLogs);
            await this.createProgressChart(fullData);
            await this.createActivityChart(fullData);
            await this.createMonthlyChart(fullData);
            
            this.hideLoadingState();
        } catch (error) {
            console.error('Error updating charts:', error);
            this.hideLoadingState();
            this.showError('Error al cargar los gráficos');
        }
    }
    
    // Show loading state for charts
    showLoadingState() {
        const chartBoxes = document.querySelectorAll('.chart-box');
        chartBoxes.forEach(box => {
            if (!box.querySelector('.spinner')) {
                const wrapper = box.querySelector('.chart-wrapper');
                if (wrapper) {
                    const spinner = document.createElement('div');
                    spinner.className = 'spinner';
                    wrapper.appendChild(spinner);
                }
            }
        });
    }
    
    // Hide loading state
    hideLoadingState() {
        const spinners = document.querySelectorAll('.chart-wrapper .spinner');
        spinners.forEach(spinner => spinner.remove());
    }
    
    // Show error message
    showError(message) {
        const chartBoxes = document.querySelectorAll('.chart-box');
        chartBoxes.forEach(box => {
            const wrapper = box.querySelector('.chart-wrapper');
            if (wrapper && !wrapper.querySelector('.error-message')) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = message;
                error.style.cssText = 'text-align: center; color: #dc3545; padding: 20px;';
                wrapper.appendChild(error);
            }
        });
    }
}

// Create global charts manager instance
const chartsManager = new ChartsManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = chartsManager;
}
