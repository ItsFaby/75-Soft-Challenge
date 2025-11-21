# 🚀 Configuración de Penalización Automática

## ¿Qué hace esta funcionalidad?

Cada día a las **12:00 AM (medianoche)** hora Costa Rica, el sistema automáticamente:

1. ✅ Verifica qué usuarios NO reportaron el día anterior
2. ✅ Les resta **-7 puntos** automáticamente
3. ✅ Crea un log visible que dice "❌ No reportó - Penalización: -7 puntos"

---

## 📦 Instalación Rápida

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Iniciar sesión en Firebase

```bash
firebase login
```

### 3. Instalar dependencias de las funciones

```bash
cd functions
npm install
cd ..
```

### 4. Hacer deploy (desplegar a producción)

```bash
firebase deploy --only functions
```

✅ ¡Listo! La función comenzará a ejecutarse automáticamente cada día a medianoche.

---

## 🧪 Probar Manualmente (Opcional)

### Opción 1: Probar localmente (Emulador)

```bash
firebase emulators:start --only functions
```

### Opción 2: Probar en producción

Después del deploy, tendrás una URL de prueba. Visítala en el navegador o usa curl:

```bash
curl https://us-central1-soft-challenge-redemption.cloudfunctions.net/testPenalizeUnreportedUsers
```

**⚠️ IMPORTANTE:** La función de prueba debe eliminarse después de verificar que funciona.

---

## 📊 Ver si está funcionando

### Ver logs en consola

```bash
firebase functions:log
```

### Ver logs en Firebase Console

1. Ir a https://console.firebase.google.com/
2. Seleccionar proyecto `soft-challenge-redemption`
3. Ir a **Functions** → **Logs**

Verás mensajes como:
```
🔍 Iniciando verificación de usuarios sin reporte...
📅 Verificando reportes del día: 2025-11-20
👥 Total de usuarios a verificar: 4
✅ Kevin ya reportó el día 2025-11-20
❌ Fabi NO reportó el día 2025-11-20 - Aplicando penalización
```

---

## ⚙️ Cambiar Configuración

### Cambiar los puntos de penalización

**En `functions/index.js` línea 83:**
```javascript
const PENALTY_POINTS = -7; // Cambiar este número
```

**En `config.js` línea 26:**
```javascript
penaltyPointsNoReport: 7, // Cambiar este número
```

Luego hacer deploy de nuevo:
```bash
firebase deploy --only functions
```

### Cambiar la hora de ejecución

**En `functions/index.js` línea 17:**
```javascript
.schedule('0 6 * * *') // 06:00 UTC = 12:00 AM Costa Rica
```

**Ejemplos:**
- `0 6 * * *` = 12:00 AM (medianoche)
- `0 7 * * *` = 01:00 AM
- `30 5 * * *` = 11:30 PM

---

## 💰 Costos

Firebase Functions tiene **tier gratuito**:
- ✅ 2 millones de invocaciones/mes gratis
- ✅ Esta función solo se ejecuta 1 vez al día (30-31 veces/mes)
- ✅ **Probablemente siempre será gratis**

---

## 🔍 Verificar que está activa

Después del deploy, en Firebase Console:

1. Ir a **Functions**
2. Deberías ver: `penalizeUnreportedUsers` con estado **ACTIVE** ✅
3. Ver el próximo horario de ejecución

---

## 🐛 Problemas Comunes

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### "Permission denied"
```bash
firebase login
```

### "Functions did not deploy"
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

---

## 📞 Más Información

Ver documentación completa en: `functions/README.md`

---

## ✅ Checklist de Deploy

- [ ] Instalar Firebase CLI
- [ ] Hacer login: `firebase login`
- [ ] Instalar dependencias: `cd functions && npm install`
- [ ] Deploy: `firebase deploy --only functions`
- [ ] Verificar en Firebase Console que la función está **ACTIVE**
- [ ] Probar manualmente (opcional)
- [ ] Ver logs para confirmar que funciona

🎉 **¡Listo! Tu sistema de penalización automática está configurado.**
