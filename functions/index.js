const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function que se ejecuta diariamente a las 12:00 AM (medianoche) hora Costa Rica (UTC-6)
 * Penaliza a los usuarios que no reportaron el día anterior
 */
exports.penalizeUnreportedUsers = functions.pubsub
  .schedule('0 6 * * *') // 06:00 UTC = 00:00 Costa Rica (UTC-6)
  .timeZone('America/Costa_Rica')
  .onRun(async (context) => {
    console.log('🔍 Iniciando verificación de usuarios sin reporte...');

    try {
      // Obtener la fecha del día anterior (porque esta función se ejecuta a medianoche)
      const yesterday = getYesterdayDate();
      console.log(`📅 Verificando reportes del día: ${yesterday}`);

      // Obtener todos los usuarios
      const usersSnapshot = await db.collection('users').get();

      if (usersSnapshot.empty) {
        console.log('⚠️ No hay usuarios en el sistema');
        return null;
      }

      const users = [];
      usersSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });

      console.log(`👥 Total de usuarios a verificar: ${users.length}`);

      let penalizedCount = 0;
      let alreadyReportedCount = 0;

      // Verificar cada usuario
      for (const user of users) {
        const userName = user.name;
        const logId = `${userName}_${yesterday}`;

        // Verificar si el usuario ya reportó ese día
        const logDoc = await db.collection('dailyLogs').doc(logId).get();

        if (logDoc.exists) {
          // El usuario ya reportó, no hacer nada
          console.log(`✅ ${userName} ya reportó el día ${yesterday}`);
          alreadyReportedCount++;
        } else {
          // El usuario NO reportó, aplicar penalización
          console.log(`❌ ${userName} NO reportó el día ${yesterday} - Aplicando penalización`);

          await penalizeUser(userName, yesterday);
          penalizedCount++;
        }
      }

      console.log(`
✨ Proceso completado:
   - Usuarios verificados: ${users.length}
   - Usuarios que reportaron: ${alreadyReportedCount}
   - Usuarios penalizados: ${penalizedCount}
   - Fecha verificada: ${yesterday}
      `);

      return {
        success: true,
        date: yesterday,
        totalUsers: users.length,
        alreadyReported: alreadyReportedCount,
        penalized: penalizedCount
      };

    } catch (error) {
      console.error('❌ Error en penalizeUnreportedUsers:', error);
      throw error;
    }
  });

/**
 * Aplica la penalización a un usuario que no reportó
 */
async function penalizeUser(userName, date) {
  const PENALTY_POINTS = -7;
  const logId = `${userName}_${date}`;

  try {
    // Crear el log diario automático con la penalización
    const penaltyLog = {
      userName: userName,
      date: date,
      activities: {
        exercise: false,
        healthyFood: false,
        reading: false,
        water: false,
        noAlcohol: false
      },
      dailyBonus: false,
      weeklyBonus: false,
      restDay: false,
      cheatMeal: false,
      sodaPass: false,
      pointsEarned: PENALTY_POINTS,
      breakdown: [
        `❌ No reportó - Penalización: ${PENALTY_POINTS} puntos`
      ],
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isAutoPenalty: true // Flag para identificar que es penalización automática
    };

    // Guardar el log de penalización
    await db.collection('dailyLogs').doc(logId).set(penaltyLog);

    // Actualizar los puntos del usuario
    const userRef = db.collection('users').doc(userName);
    await userRef.update({
      points: admin.firestore.FieldValue.increment(PENALTY_POINTS),
      lastPenaltyDate: date
    });

    console.log(`   💾 Penalización guardada para ${userName}: ${PENALTY_POINTS} puntos`);

  } catch (error) {
    console.error(`   ❌ Error al penalizar a ${userName}:`, error);
    throw error;
  }
}

/**
 * Obtiene la fecha del día anterior en formato YYYY-MM-DD (zona horaria Costa Rica)
 */
function getYesterdayDate() {
  // Crear fecha actual en zona horaria de Costa Rica (UTC-6)
  const now = new Date();

  // Convertir a hora de Costa Rica
  const costaRicaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));

  // Restar un día para obtener el día anterior
  costaRicaTime.setDate(costaRicaTime.getDate() - 1);

  // Formatear como YYYY-MM-DD
  const year = costaRicaTime.getFullYear();
  const month = String(costaRicaTime.getMonth() + 1).padStart(2, '0');
  const day = String(costaRicaTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Función HTTP de prueba para ejecutar la penalización manualmente
 * Solo para desarrollo - ELIMINAR en producción por seguridad
 */
exports.testPenalizeUnreportedUsers = functions.https.onRequest(async (req, res) => {
  try {
    console.log('🧪 Ejecutando penalización manual (TEST)...');

    // Ejecutar la misma lógica que la función scheduled
    const yesterday = getYesterdayDate();
    const usersSnapshot = await db.collection('users').get();

    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    let penalizedCount = 0;
    let alreadyReportedCount = 0;

    for (const user of users) {
      const userName = user.name;
      const logId = `${userName}_${yesterday}`;
      const logDoc = await db.collection('dailyLogs').doc(logId).get();

      if (logDoc.exists) {
        alreadyReportedCount++;
      } else {
        await penalizeUser(userName, yesterday);
        penalizedCount++;
      }
    }

    res.json({
      success: true,
      message: 'Penalización ejecutada manualmente',
      date: yesterday,
      totalUsers: users.length,
      alreadyReported: alreadyReportedCount,
      penalized: penalizedCount
    });

  } catch (error) {
    console.error('Error en test:', error);
    res.status(500).json({ error: error.message });
  }
});
