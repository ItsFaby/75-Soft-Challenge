# Firebase Cloud Functions - 75 Soft Challenge

## 📋 Descripción

Este directorio contiene las Cloud Functions de Firebase para la aplicación 75 Soft Challenge.

### Función Principal: `penalizeUnreportedUsers`

**Función automática** que se ejecuta diariamente a las **12:00 AM (medianoche)** hora de Costa Rica (UTC-6).

**¿Qué hace?**
1. ✅ Verifica todos los usuarios del sistema
2. ✅ Revisa si cada usuario reportó el día anterior
3. ✅ Si NO reportó, crea un log automático con **-7 puntos** de penalización
4. ✅ Actualiza los puntos totales del usuario
5. ✅ Registra la penalización en el historial visible

---

## 🚀 Despliegue (Deploy)

### Requisitos Previos

1. **Instalar Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Iniciar sesión en Firebase**
   ```bash
   firebase login
   ```

3. **Verificar proyecto actual**
   ```bash
   firebase projects:list
   ```

### Pasos para Deploy

1. **Navegar al directorio del proyecto**
   ```bash
   cd /home/user/75-Soft-Challenge
   ```

2. **Inicializar Firebase Functions (solo la primera vez)**
   ```bash
   firebase init functions
   ```

   **Opciones a seleccionar:**
   - ¿Usar proyecto existente? → **Sí** → `soft-challenge-redemption`
   - ¿Qué lenguaje? → **JavaScript**
   - ¿Usar ESLint? → **No** (opcional)
   - ¿Instalar dependencias? → **Sí**

3. **Instalar dependencias en el directorio functions**
   ```bash
   cd functions
   npm install
   cd ..
   ```

4. **Hacer deploy de las funciones**
   ```bash
   firebase deploy --only functions
   ```

   O para desplegar solo la función de penalización:
   ```bash
   firebase deploy --only functions:penalizeUnreportedUsers
   ```

---

## 🧪 Pruebas

### Probar localmente (Emulador)

```bash
cd functions
npm install
firebase emulators:start --only functions
```

### Probar manualmente (después del deploy)

Existe una función HTTP de prueba llamada `testPenalizeUnreportedUsers` que puedes ejecutar manualmente:

```bash
# Después del deploy, obtendrás una URL como:
# https://us-central1-soft-challenge-redemption.cloudfunctions.net/testPenalizeUnreportedUsers

# Probarla con curl:
curl https://[TU-URL-DE-CLOUD-FUNCTION]/testPenalizeUnreportedUsers
```

**⚠️ IMPORTANTE:** Esta función de prueba debe eliminarse en producción por seguridad.

---

## 📊 Monitoreo

### Ver logs en tiempo real

```bash
firebase functions:log
```

### Ver logs en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Seleccionar proyecto `soft-challenge-redemption`
3. Ir a **Functions** → **Logs**

---

## ⚙️ Configuración

### Cambiar la hora de ejecución

Si necesitas cambiar la hora a la que se ejecuta la función, edita el archivo `functions/index.js`:

```javascript
exports.penalizeUnreportedUsers = functions.pubsub
  .schedule('0 6 * * *') // Formato cron: minuto hora dia mes día-semana
  .timeZone('America/Costa_Rica')
```

**Ejemplos:**
- `0 6 * * *` = 06:00 UTC = 12:00 AM Costa Rica
- `0 7 * * *` = 07:00 UTC = 01:00 AM Costa Rica
- `30 5 * * *` = 05:30 UTC = 11:30 PM Costa Rica

### Cambiar los puntos de penalización

1. **En la Cloud Function** (`functions/index.js` línea 83):
   ```javascript
   const PENALTY_POINTS = -7; // Cambiar este valor
   ```

2. **En la configuración de la app** (`config.js` línea 26):
   ```javascript
   penaltyPointsNoReport: 7, // Cambiar este valor
   ```

---

## 🔒 Seguridad

### Permisos necesarios

Las Cloud Functions necesitan permisos para:
- ✅ Leer/escribir en Firestore (`users` y `dailyLogs`)
- ✅ Ejecutarse en horario programado (Pub/Sub)

### Costos

Firebase Functions tiene un **tier gratuito** generoso:
- **2 millones de invocaciones/mes** gratis
- **400,000 GB-segundos** de tiempo de cómputo gratis
- **200,000 GHz-segundos** de tiempo de CPU gratis

Esta función se ejecuta **1 vez al día** (30-31 veces/mes), por lo que **probablemente nunca saldrá del tier gratuito**.

---

## 📝 Estructura de la Penalización

Cuando un usuario NO reporta, se crea automáticamente este log:

```javascript
{
  userName: "Kevin",
  date: "2025-11-20",
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
  pointsEarned: -7,
  breakdown: ["❌ No reportó - Penalización: -7 puntos"],
  timestamp: [Server Timestamp],
  isAutoPenalty: true // Flag para identificar penalizaciones automáticas
}
```

---

## 🐛 Troubleshooting

### Error: "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### Error: "Not authorized"
```bash
firebase login
firebase projects:list
```

### Error: "Functions did not deploy properly"
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Ver errores en tiempo real
```bash
firebase functions:log --only penalizeUnreportedUsers
```

---

## 🔄 Actualizar la función

Si haces cambios en `functions/index.js`:

1. **Guardar los cambios**
2. **Hacer deploy nuevamente**
   ```bash
   firebase deploy --only functions
   ```

La función se actualizará automáticamente sin afectar los datos existentes.

---

## 📞 Soporte

Para más información sobre Firebase Functions:
- [Documentación oficial](https://firebase.google.com/docs/functions)
- [Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)
- [Firestore con Functions](https://firebase.google.com/docs/functions/firestore-events)
