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
    penaltyPointsNoReport: 7, // Puntos que se restan automáticamente si no se reporta el día (Cloud Function)
    startDate: '2025-11-17',
    endDate: '2026-03-02',

    // Development mode settings (set to true to enable dev tools)
    DEV_MODE: false, // Set to true to show dev controls in UI
    DEV_DAYS_OFFSET: 0, // Change this to advance/rewind days (only works when DEV_MODE is true)

    // Allow editing previous days logs (developer only - restricted for participants)
    ALLOW_EDIT_PREVIOUS_DAYS: false, // Set to true to enable navigation and editing of previous days
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
    { text: '🧘‍♀️ 10 minutos de estiramientos', id: 'yoga', day: 1 },
    {
      text: '🛋️ Sentarte 10 minutos en completo silencio',
      id: 'stillness',
      day: 3,
    },
    {
      text: '🚶‍♀️ Caminar al aire libre al menos 10 min',
      id: 'outdoorwalk',
      day: 3,
    },
    {
      text: '💪 10 minutos de ejercicio adicional',
      id: 'extraworkout',
      day: 4,
    },
    {
      text: '📚 Leer 15 páginas extra o escuchar 30 min de podcast',
      id: 'extrareading',
      day: 5,
    },
    { text: 'Lavar o limpiar algo olvidado', id: 'extrawater', day: 6 },

    { text: '🛌 Dormir 7–8 horas', id: 'sleepwell', day: 7 },
    {
      text: '📵 1 hora sin pantallas antes de dormir',
      id: 'noscreens',
      day: 8,
    },
    {
      text: '🧹 Limpiar o ordenar un espacio pequeño',
      id: 'declutter',
      day: 9,
    },
    {
      text: '😌 10 minutos de respiración consciente',
      id: 'breathing',
      day: 10,
    },
    {
      text: '📓 Escribir 5 cosas por las que agradeces',
      id: 'gratitude',
      day: 11,
    },
    { text: '🥦 Comer 3 porciones de vegetales', id: 'moreveggies', day: 12 },
    { text: '🌞 Pasar 10 minutos al sol', id: 'sunlight', day: 13 },

    {
      text: '📦 Organizar una carpeta del móvil o computadora',
      id: 'morningwater',
      day: 14,
    },
    {
      text: '🧍 Mantener postura recta 30 min consciente',
      id: 'posture',
      day: 15,
    },
    { text: '🏃‍♀️ 20 minutos de cardio ligero', id: 'lightcardio', day: 16 },
    { text: '🎧 Escuchar un audio motivacional', id: 'plan', day: 17 },
    {
      text: '😁 Sonreír a 3 personas o dar 3 cumplidos',
      id: 'positiveinteractions',
      day: 18,
    },
    { text: '💭 10 minutos de reflexión personal', id: 'reflection', day: 19 },
    {
      text: '🚶 Hacer una caminata consciente sin música',
      id: 'mindfulwalk',
      day: 20,
    },

    { text: '⏳ Evitar azúcar procesada por 24h', id: 'nosugar', day: 21 },
    { text: '💨 10 minutos de movilidad articular', id: 'mobility', day: 22 },
    { text: '📖 Leer 20 minutos de no ficción', id: 'nonfiction', day: 23 },
    {
      text: '🤲 Hacer un acto de servicio pequeño',
      id: 'lemonwater',
      day: 24,
    },
    {
      text: '🧴 Crear una mini rutina de cuidado personal',
      id: 'selfcare',
      day: 25,
    },
    {
      text: '🧠 Practicar visualización 5 minutos',
      id: 'visualization',
      day: 26,
    },
    { text: '🍎 Comer una fruta fresca hoy', id: 'fruits', day: 27 },

    {
      text: '🚶‍♂️ Caminar 5 minutos cada hora durante el día (al menos 5 veces)',
      id: 'movementbreaks',
      day: 28,
    },
    {
      text: '🧊 Terminar la ducha con 30s de agua fría',
      id: 'coldshower',
      day: 29,
    },
    { text: '💬 Conectar con un amigo/familiar', id: 'connect', day: 30 },
    {
      text: '🧘‍♂️ 15 minutos de meditación guiada',
      id: 'guidedmeditation',
      day: 31,
    },
    {
      text: '🍽️ Comer sin pantallas en todas las comidas',
      id: 'mindfuleating',
      day: 32,
    },
    { text: '📅 Organizar la semana', id: 'organizeweek', day: 33 },
    { text: '🌿 Pasar tiempo en la naturaleza', id: 'nature', day: 34 },

    {
      text: '🫁 Practicar respiración 4-7-8 por 5 min',
      id: '478breathing',
      day: 35,
    },
    {
      text: '💬 Escribir una carta o mensaje de agradecimiento',
      id: 'podcastedu',
      day: 36,
    },
    { text: '🏡 Hacer una limpieza de 10 minutos', id: 'quickclean', day: 37 },
    { text: '💫 Evitar quejas por 24h', id: 'nocomplaints', day: 38 },
    {
      text: '🗂️ Revisar y borrar archivos del móvil',
      id: 'digitalclean',
      day: 39,
    },
    {
      text: '📷 Tomar una foto de algo que te inspire',
      id: 'inspirationphoto',
      day: 40,
    },
    { text: '☀️ Ver el amanecer o atardecer', id: 'nosweetdrinks', day: 41 },

    { text: '🧗 Hacer 25 sentadillas', id: 'squats25', day: 42 },
    {
      text: '👐 20 flexiones contra pared o estándar',
      id: 'pushups20',
      day: 43,
    },
    { text: '🔥 Plancha 1 minuto total', id: 'plank1min', day: 44 },
    { text: '🦵 30 zancadas (15 por pierna)', id: 'lunges', day: 45 },
    { text: '📱 2 horas sin redes sociales', id: 'nosocial', day: 46 },
    {
      text: '🎯 Cumplir una pequeña tarea pendiente',
      id: 'pendiente',
      day: 47,
    },
    {
      text: '💆 Practicar autocuidado emocional 10 min',
      id: 'emotionalcare',
      day: 48,
    },

    {
      text: '🌸 Dedicar 10 minutos a un hobby creativo',
      id: 'nocaffeinepm',
      day: 49,
    },
    { text: '📒 Escribir 1 página de diario', id: 'journaling', day: 50 },
    { text: '🥕 Añadir un snack saludable', id: 'healthysnack', day: 51 },
    {
      text: '💨 Respiración diafragmática 5 min',
      id: 'diaphragmatic',
      day: 52,
    },
    {
      text: '🚶 Caminar 20 min después de una comida',
      id: 'postmealwalk',
      day: 53,
    },
    { text: '🛏️ Ordenar tu cama antes de las 2pm', id: 'makebed', day: 54 },
    {
      text: '🔄 Evitar multitasking durante el día',
      id: 'nomultitask',
      day: 55,
    },

    {
      text: '😊 Practicar afirmaciones positivas 5 min',
      id: 'affirmations',
      day: 56,
    },
    {
      text: '📓 Escribir una lista de objetivos semanales',
      id: 'hiddenarea',
      day: 57,
    },
    { text: '🧠 Aprender algo nuevo en 10 min', id: 'learn', day: 58 },
    { text: '🙏 Hacer 5 min de silencio total', id: 'silence', day: 59 },
    { text: '🔌 1 comida sin teléfono cerca', id: 'phonelessmeal', day: 60 },
    {
      text: '👣 Caminar 20 min con atención a la respiración',
      id: 'breathwalk',
      day: 61,
    },
    { text: '📚 Leer 10 páginas de ficción', id: 'fiction', day: 62 },

    { text: '🧴 Hacer una mascarilla natural casera', id: 'skincare', day: 63 },
    {
      text: '🌬️ 10 min de estiramientos de pecho y espalda',
      id: 'backstretch',
      day: 64,
    },
    {
      text: '🫀 Subir 10 tramos de escaleras durante el día',
      id: 'stairs',
      day: 65,
    },
    {
      text: '🗃️ Depurar tu bandeja de entrada 10 minutos',
      id: 'emailclean',
      day: 66,
    },
    { text: '💓 Hacer algo amable por alguien', id: 'kindness', day: 67 },
    {
      text: '🌿 5 min de grounding (pies en el suelo)',
      id: 'grounding',
      day: 68,
    },
    { text: '🍽️ Comer lentamente toda la jornada', id: 'slowfood', day: 69 },

    {
      text: '📝 Establecer una meta pequeña del mes',
      id: 'smallgoal',
      day: 70,
    },
    {
      text: '📦 Eliminar 5 objetos que no necesitas',
      id: 'declutter5',
      day: 71,
    },
    { text: '🎶 Escuchar música relajante 15 min', id: 'relaxmusic', day: 72 },
    { text: '🕺 Bailar 10 minutos', id: 'dance', day: 73 },
    {
      text: '🌟 Dar un review de que tal fue el proceso de todo el desafío',
      id: 'review',
      day: 74,
    },
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
