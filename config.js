// ===== App Configuration =====
const AppConfig = {
  // Toggle between mock data and Firebase
  USE_MOCK_DATA: false, // Set to false to use Firebase

  // Firebase configuration
  FIREBASE_CONFIG: {
    apiKey: 'AIzaSyDb-IvLWHWkvsjVIKmCF4mjH4iDEloCZTo',
    authDomain: 'soft-challenge-redemption.firebaseapp.com',
    projectId: 'soft-challenge-redemption',
    storageBucket: 'soft-challenge-redemption.firebasestorage.app',
    messagingSenderId: '214451904832',
    appId: '1:214451904832:web:f59d64cb1e2b3c79fa5aa5',
  },

  // App settings
  APP_SETTINGS: {
    appName: '75 Soft: Redemption Edition',
    version: '2.0.0',
    prizeAmount: 500,
    challengeDuration: 75, // days
    pointsPerActivity: 1,
    penaltyPoints: 3,
    weeklyBonusPoints: 5,
    dailyBonusPoints: 1,
    startDate: '2025-10-01',
    endDate: '',

    // Development mode settings (set to true to enable dev tools)
    DEV_MODE: true, // Set to true to show dev controls in UI
    DEV_DAYS_OFFSET: 0, // Change this to advance/rewind days (only works when DEV_MODE is true)
  },

  // Users configuration
  USERS: {
    Kevin: {
      id: 'kevin',
      name: 'Kevin',
      personalChallenge: 'noAlcohol',
      penaltyDescription:
        'Si toma alcohol o Coca Zero: -3 puntos (en lugar de -1)',
    },
    Fabi: {
      id: 'fabi',
      name: 'Fabi',
      personalChallenge: 'healthyFood',
      penaltyDescription: 'Si no come saludable: -3 puntos (en lugar de -1)',
    },
    Vivi: {
      id: 'vivi',
      name: 'Vivi',
      personalChallenge: 'exercise',
      penaltyDescription: 'Si no hace ejercicio: -3 puntos (en lugar de -1)',
    },
    Yuli: {
      id: 'yuli',
      name: 'Yuli',
      personalChallenge: 'exercise',
      penaltyDescription: 'Si no hace ejercicio: -3 puntos (en lugar de -1)',
    },
  },

  // Daily challenges rotation - GLOBAL for all users (same challenge for everyone each day)
  DAILY_CHALLENGES: [
    { text: '🏃‍♂️ Hacer 10,000 pasos', id: 'steps10k', day: 0 },
    { text: '🧘‍♀️ 30 minutos de yoga o estiramientos', id: 'yoga', day: 1 },
    {
      text: '🥗 Preparar una comida saludable adicional',
      id: 'healthymeal',
      day: 2,
    },
    { text: '🚶‍♀️ Caminar al aire libre 30 min', id: 'outdoorwalk', day: 3 },
    {
      text: '💪 20 minutos de ejercicio adicional',
      id: 'extraworkout',
      day: 4,
    },
    {
      text: '📚 Leer 15 páginas extra o escuchar 30 min de podcast',
      id: 'extrareading',
      day: 5,
    },
    { text: '💧 Tomar 3L de agua (1L extra)', id: 'extrawater', day: 6 },
  ],

  // Activities list
  ACTIVITIES: [
    { id: 'exercise', name: '45 minutos de ejercicio', icon: '🏃‍♂️' },
    { id: 'healthyFood', name: 'Comer saludable', icon: '🥗' },
    {
      id: 'reading',
      name: '10 páginas de libro o 15 min de podcast',
      icon: '📚',
    },
    { id: 'water', name: 'Tomar 1L de agua', icon: '💧' },
    { id: 'noAlcohol', name: 'No alcohol ni Coca Zero', icon: '🚫' },
  ],

  // Free passes configuration
  FREE_PASSES: {
    restDay: {
      name: 'Día de descanso',
      icon: '😴',
      affectsActivity: 'exercise',
      perWeek: 1,
    },
    cheatMeal: {
      name: 'Comida chatarra permitida',
      icon: '🍔',
      affectsActivity: 'healthyFood',
      perWeek: 1,
    },
    sodaPass: {
      name: 'Bebida gasificada/cero permitida',
      icon: '🥤',
      affectsActivity: 'noAlcohol',
      perWeek: 1,
    },
  },
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
