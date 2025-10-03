# 🤖 Sistema Híbrido de IA - MVP Riego Automatizado

## 🚀 **Características del Sistema**

Tu MVP ahora tiene un **sistema híbrido de IA** que puede alternar entre:

### 1. **Servicio Mock** (Desarrollo)
- 🔧 **Perfecto para desarrollo y testing**
- 💰 **Sin costos de API**
- ⚡ **Respuesta instantánea**
- 🔄 **Siempre disponible**

### 2. **Roboflow AI** (Producción)
- 🎯 **IA real para clasificación de plantas**
- 📷 **Análisis preciso de imágenes**
- 🌱 **Detección automática de especies**
- ☁️ **Servicio en la nube**

## ⚙️ **Configuración**

### Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto:

```bash
# Modo de IA: 'mock' o 'roboflow'
AI_MODE=mock

# API Key de Roboflow (para producción)
ROBOFLOW_API_KEY=tu_api_key_aqui

# NASA API Key
NASA_API_KEY=DEMO_KEY
```

### Cambiar Modo Dinámicamente

Puedes cambiar entre servicios **sin reiniciar** usando la API:

```bash
# Cambiar a Mock
curl -X POST http://localhost:3001/api/ai-mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "mock"}'

# Cambiar a Roboflow
curl -X POST http://localhost:3001/api/ai-mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "roboflow"}'

# Ver estado actual
curl http://localhost:3001/api/ai-status
```

## 🛡️ **Sistema de Fallback**

Si Roboflow falla, el sistema automáticamente:
1. ⚠️ Detecta el error
2. 🔄 Cambia al servicio Mock
3. ✅ Continúa funcionando
4. 📝 Registra el fallback en logs

## 🔧 **Endpoints de la API**

### Clasificación de Plantas
- **POST** `/api/classify-plant` - Clasifica imagen
- **GET** `/api/ai-status` - Estado del sistema IA
- **POST** `/api/ai-mode` - Cambiar modo IA

### Respuesta Mejorada
```json
{
  "detected": "romero",
  "confidence": 0.95,
  "plant_used": "romero",
  "service_used": "roboflow",
  "fallback_used": false,
  "timestamp": "2025-10-03T..."
}
```

## 🚀 **Para Usar Roboflow Real**

1. **Crea cuenta** en [Roboflow](https://app.roboflow.com/)
2. **Obtén tu API Key**
3. **Entrena modelo** con imágenes de plantas
4. **Actualiza** `.env` con tu API key
5. **Cambia modo** a `roboflow`

## 🎯 **Beneficios del Sistema Híbrido**

✅ **Desarrollo rápido** con Mock
✅ **Producción real** con Roboflow
✅ **Fallback automático** sin interrupciones
✅ **Sin reinicio** para cambiar modos
✅ **Monitoreo completo** del estado
✅ **Costos controlados** durante desarrollo

¡Tu sistema está ahora preparado para **desarrollo Y producción**! 🌱🤖