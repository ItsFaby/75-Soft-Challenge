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
        dailyBonusPoints: 1
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
    
    // Daily challenges rotation
    DAILY_CHALLENGES: [
        { text: "🏃‍♂️ Hacer 12,000 pasos", id: "steps12k", day: 0 },
        { text: "🏊‍♂️ Hacer natación por 30 minutos", id: "swimming", day: 1 },
        { text: "🧘‍♀️ 20 minutos de yoga o estiramientos", id: "yoga", day: 2 },
        { text: "🚴‍♂️ 30 minutos de bicicleta", id: "cycling", day: 3 },
        { text: "🏋️‍♀️ Entrenamiento de fuerza", id: "strength", day: 4 },
        { text: "⚽ Jugar algún deporte", id: "sport", day: 5 },
        { text: "🥒 Comer solo vegetales en una comida", id: "veggies", day: 6 }
    ],
    
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
