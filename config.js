// ===== App Configuration =====
const AppConfig = {
    // Toggle between mock data and Firebase
    USE_MOCK_DATA: false, // Set to false to use Firebase
    
    // Firebase configuration
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyAJ5DFnPW8gjfqSGD0gPCcqw-iSAbqZBnU",
        authDomain: "soft-challenge-fda98.firebaseapp.com",
        projectId: "soft-challenge-fda98",
        storageBucket: "soft-challenge-fda98.firebasestorage.app",
        messagingSenderId: "246050406415",
        appId: "1:246050406415:web:2c8cd6c3a42aecd37ce37a",
        measurementId: "G-P5D07YR35N"
    },
    
    // App settings
    APP_SETTINGS: {
        appName: "75 Soft: Redemption Edition",
        version: "2.0.0",
        prizeAmount: 500,
        challengeDuration: 75, // days
        pointsPerActivity: 1,
        penaltyPoints: 3,
        weeklyBonusPoints: 4,
        dailyBonusPoints: 1,
        startDate : "2025-10-01",
        endDate: ""
    },
    
    // Users configuration
    USERS: {
        Kevin: {
            id: "kevin",
            name: "Kevin",
            personalChallenge: "noAlcohol",
            penaltyDescription: "Si toma alcohol o Coca Zero: -3 puntos (en lugar de -1)"
        },
        Fabi: {
            id: "fabi",
            name: "Fabi",
            personalChallenge: "healthyFood",
            penaltyDescription: "Si no come saludable: -3 puntos (en lugar de -1)"
        },
        Vivi: {
            id: "vivi",
            name: "Vivi",
            personalChallenge: "exercise",
            penaltyDescription: "Si no hace ejercicio: -3 puntos (en lugar de -1)"
        },
        Yuli: {
            id: "yuli",
            name: "Yuli",
            personalChallenge: "exercise",
            penaltyDescription: "Si no hace ejercicio: -3 puntos (en lugar de -1)"
        }
    },
    
    // Daily challenges rotation - now personalized per user
    DAILY_CHALLENGES: {
        Kevin: [
            { text: "🏃‍♂️ Hacer 12,000 pasos", id: "steps12k", day: 0 },
            { text: "🏊‍♂️ Hacer natación por 30 minutos", id: "swimming", day: 1 },
            { text: "🧘‍♀️ 20 minutos de yoga o estiramientos", id: "yoga", day: 2 },
            { text: "🚴‍♂️ 30 minutos de bicicleta", id: "cycling", day: 3 },
            { text: "🏋️‍♀️ Entrenamiento de fuerza", id: "strength", day: 4 },
            { text: "⚽ Jugar algún deporte", id: "sport", day: 5 },
            { text: "🥒 Comer solo vegetales en una comida", id: "veggies", day: 6 }
        ],
        Fabi: [
            { text: "🏃‍♂️ Hacer 10,000 pasos", id: "steps10k", day: 0 },
            { text: "🧘‍♀️ 30 minutos de yoga", id: "yoga30", day: 1 },
            { text: "🥗 Preparar comida saludable para toda la semana", id: "mealprep", day: 2 },
            { text: "🚶‍♀️ Caminar al aire libre 30 min", id: "outdoorwalk", day: 3 },
            { text: "💪 20 minutos de ejercicio en casa", id: "homeworkout", day: 4 },
            { text: "🎨 30 min de actividad creativa", id: "creative", day: 5 },
            { text: "🧘‍♀️ Meditar 15 minutos", id: "meditation", day: 6 }
        ],
        Vivi: [
            { text: "🏃‍♀️ Correr 5km", id: "run5k", day: 0 },
            { text: "🏋️‍♀️ Entrenamiento HIIT 30 min", id: "hiit", day: 1 },
            { text: "🧘‍♀️ Yoga avanzado 45 min", id: "advancedyoga", day: 2 },
            { text: "🚴‍♀️ Spinning 45 minutos", id: "spinning", day: 3 },
            { text: "💪 Entrenamiento de fuerza con pesas", id: "weights", day: 4 },
            { text: "🏊‍♀️ Natación 1km", id: "swim1k", day: 5 },
            { text: "🧗‍♀️ Actividad deportiva intensa", id: "intensesport", day: 6 }
        ],
        Yuli: [
            { text: "🏃‍♀️ Hacer 8,000 pasos", id: "steps8k", day: 0 },
            { text: "💃 30 min de baile o zumba", id: "dance", day: 1 },
            { text: "🧘‍♀️ 25 minutos de pilates", id: "pilates", day: 2 },
            { text: "🚶‍♀️ Caminata rápida 40 min", id: "fastwalk", day: 3 },
            { text: "🏋️‍♀️ Ejercicios de tonificación", id: "toning", day: 4 },
            { text: "🎾 Actividad deportiva recreativa", id: "recreationalsport", day: 5 },
            { text: "🧘‍♀️ Estiramientos y movilidad 30 min", id: "stretching", day: 6 }
        ]
    },
    
    // Activities list
    ACTIVITIES: [
        { id: "exercise", name: "45 minutos de ejercicio", icon: "🏃‍♂️" },
        { id: "healthyFood", name: "Comer saludable", icon: "🥗" },
        { id: "reading", name: "10 páginas de libro o 15 min de podcast", icon: "📚" },
        { id: "water", name: "Tomar 1L de agua", icon: "💧" },
        { id: "noAlcohol", name: "No alcohol ni Coca Zero", icon: "🚫" }
    ],
    
    // Free passes configuration
    FREE_PASSES: {
        restDay: {
            name: "Día de descanso",
            icon: "😴",
            affectsActivity: "exercise",
            perWeek: 1
        },
        cheatMeal: {
            name: "Comida chatarra permitida",
            icon: "🍔",
            affectsActivity: "healthyFood",
            perWeek: 1
        },
        sodaPass: {
            name: "Bebida gasificada/cero permitida",
            icon: "🥤",
            affectsActivity: "noAlcohol",
            perWeek: 1
        }
    }
};

// Load saved config from localStorage if exists
function loadSavedConfig() {
    const savedConfig = localStorage.getItem('75soft_config');
    if (savedConfig) {
        try {
            const parsed = JSON.parse(savedConfig);
            // Merge saved config with default config
            Object.assign(AppConfig, parsed);
        } catch (error) {
            console.error('Error loading saved config:', error);
        }
    }
}

// Save config to localStorage
function saveConfig() {
    try {
        localStorage.setItem('75soft_config', JSON.stringify(AppConfig));
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
}

// Initialize config on load
loadSavedConfig();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
