# 🌱 MVP Sistema de Riego Automatizado

Sistema inteligente de riego que utiliza APIs de la NASA y datos meteorológicos en tiempo real para calcular las necesidades de agua de las plantas.

## 🚀 Características

- **📊 Cálculo Inteligente**: Usa evapotranspiración (ET₀) con coeficientes específicos por planta
- **🌿 Plantas Específicas**: Menta (alta necesidad) y Romero (baja necesidad) con diferentes Kc
- **🌡️ Datos en Tiempo Real**: Integración con Open-Meteo para datos meteorológicos actuales
- **🛰️ Tecnología NASA**: Imagen astronómica del día (APOD) como fondo dinámico
- **📱 Interfaz Moderna**: Dashboard responsive con selector de plantas y gráficos
- **⚡ Desarrollo Rápido**: Configuración simple para hackathons y demos

## 🏗️ Arquitectura

```
mvp-riego-automatizado/
├── package.json           # Scripts principales del proyecto
├── backend/              # API Server (Express + TypeScript)
│   ├── src/
│   │   └── server.ts     # Servidor principal con endpoints
│   ├── package.json
│   └── tsconfig.json
├── frontend/             # React App (Vite + TypeScript)
│   ├── src/
│   │   ├── App.tsx       # Componente principal
│   │   ├── App.css       # Estilos del dashboard
│   │   ├── main.tsx      # Punto de entrada
│   │   └── index.css     # Estilos globales
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## 🍎 Configuración en macOS (Mi Máquina)

### Sistema usado para desarrollo:
- **OS**: macOS (Mi desarrollo)
- **Python**: 3.8+ requerido para Plant Vision
- **Node.js**: Para backend y frontend
- **Cámara**: Built-in webcam + soporte para GoPro USB

### Setup inicial en Mac:
```bash
# 1. Verificar Python (necesario ≥3.8)
python3 --version

# 2. Si Python es viejo, instalar versión nueva
brew install python@3.11

# 3. Instalar dependencias Node.js
npm run install:all

# 4. Instalar dependencias Python para IA
pip3 install -r plant-vision/requirements.txt
```

## 🚀 Inicio Rápido

### Opción A: Servicios individuales (4 terminales)
```bash
# Terminal 1: IA Mock (Puerto 5000)
python3 plant-vision/mock_ai_server.py

# Terminal 2: Backend (Puerto 3001)
npm run dev:backend

# Terminal 3: Frontend (Puerto 3000)
npm run dev:frontend

# Terminal 4: Webcam opcional
python3 plant-vision/webcam_capture.py
```

### Opción B: Solo web (2 terminales)
```bash
# Terminal 1: IA Mock
python3 plant-vision/mock_ai_server.py

# Terminal 2: Backend + Frontend
npm run dev
```

Esto iniciará:
- **Backend**: http://localhost:3001 (API endpoints)
- **Frontend**: http://localhost:3000 (Dashboard)

### 3. Producción
```bash
# Construir frontend
npm run build

# Ejecutar servidor de producción
npm start
```

## 📡 API Endpoints

### `/api/watering-calculation`
Calcula las necesidades de riego basado en coordenadas GPS.

**Parámetros:**
- `lat`: Latitud (opcional, default: EINA Zaragoza)
- `lon`: Longitud (opcional, default: EINA Zaragoza)
- `plant`: Tipo de planta (opcional, default: 'menta')

**Ejemplo:**
```
   GET /api/watering-calculation?lat=41.6836&lon=-0.8881
```

**Respuesta:**
```json
{
  "requiredMl": 250,
  "currentTemp": 22.5,
  "currentHumidity": 65,
  "hourlyForecast": {
    "temperatures": [22.5, 23.1, ...],
    "humidity": [65, 63, ...],
    "times": ["2024-01-01T12:00", ...]
  },
  "location": { "lat": 40.4168, "lon": -3.7038 },
  "potSize": 20,
  "calculation": {
    "totalET": 2.5,
    "surfaceM2": 0.0314,
    "requiredLitres": 0.25
  }
}
```

### `/api/apod`
Obtiene la imagen astronómica del día de la NASA.

**Respuesta:**
```json
{
  "title": "The Horsehead Nebula",
  "explanation": "One of the most identifiable nebulae...",
  "url": "https://apod.nasa.gov/apod/image/2024/horsehead.jpg",
  "mediaType": "image",
  "date": "2024-01-01"
}
```

### `/api/plants`
Obtiene la lista de plantas disponibles con sus características.

**Respuesta:**
```json
{
  "plants": [
    {
      "id": "menta",
      "name": "🌿 Menta",
      "description": "Necesita mucha agua, hojas jugosas",
      "coefficient": 1.2,
      "waterNeed": "Alta"
    },
    {
      "id": "romero",
      "name": "🌱 Romero",
      "description": "Resistente a sequía, aromática mediterránea",
      "coefficient": 0.6,
      "waterNeed": "Baja"
    }
  ]
}
```

### `/api/health`
Endpoint de estado del servidor.

## 🧮 Lógica de Cálculo

El sistema calcula las necesidades de agua usando la fórmula:

```
Agua (ml) = ET₀ (mm) × Superficie_Maceta (m²) × 1000
```

Donde:
- **ET₀**: Evapotranspiración de referencia (suma de 24h)
- **Superficie**: πr² basado en diámetro de maceta
- **Factor 1000**: Conversión de litros a mililitros

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Backend + Frontend en paralelo
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend

# Instalación
npm run install:all      # Instalar todas las dependencias

# Producción
npm run build           # Construir frontend
npm start              # Servidor de producción

# Utilidades
npm run clean          # Limpiar node_modules
```

## 🌐 APIs Utilizadas

### Open-Meteo API
- **URL**: https://api.open-meteo.com
- **Datos**: Temperatura, humedad, evapotranspiración
- **Ventajas**: Gratuita, sin API key, datos en tiempo real

### NASA APOD API
- **URL**: https://api.nasa.gov/planetary/apod
- **Datos**: Imagen astronómica del día
- **API Key**: `DEMO_KEY` (limitada) - Para producción obtener key en https://api.nasa.gov

## 🔧 Configuración

### Variables de Entorno (Opcional)
Crear `.env` en `/backend`:
```env
NASA_API_KEY=tu_api_key_aqui
PORT=3001
NODE_ENV=development
```

### Coordenadas por Defecto
Modificar en `/backend/src/server.ts`:
```typescript
const DEFAULT_LATITUDE = 40.4168;  // Madrid
const DEFAULT_LONGITUDE = -3.7038;
```

## 🎯 Extensiones Futuras

### Paso 2: NASA POWER Integration
```typescript
// Endpoint para datos históricos de NASA POWER
app.get('/api/power-analytics', async (req, res) => {
  // Implementar llamada a NASA POWER API
  // URL: https://power.larc.nasa.gov/api/temporal/daily/point
});
```

### Paso 3: EPIC Earth Images
```typescript
// Endpoint para imágenes de la Tierra desde el espacio
app.get('/api/epic-image', async (req, res) => {
  // Implementar llamada a NASA EPIC API
});
```

### Paso 4: Sensores IoT
- Integración con Arduino/Raspberry Pi
- Sensores de humedad del suelo
- Automatización física del riego

## 🐛 Troubleshooting

### Puerto en uso
```bash
# Cambiar puerto en backend/src/server.ts
const PORT = 3002;

# Cambiar puerto en frontend/vite.config.ts
server: { port: 3001 }
```

### Errores de CORS
El backend ya incluye configuración CORS. Si hay problemas:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001']
}));
```

### Cache de APIs
El sistema incluye cache de 10 minutos para evitar límites de rate. Para desactivar:
```typescript
const CACHE_DURATION = 0; // Desactivar cache
```

## 📊 Demo Data

El sistema incluye datos por defecto para EINA Zaragoza:
- **Latitud**: 41.6836° (41°41'01"N)
- **Longitud**: -0.8881° (0°53'17"O)
- **Ubicación**: Edificio EINA - Universidad de Zaragoza
- **Tamaño de maceta**: 10cm diámetro
- **Plantas**: Menta (Kc=1.2) y Romero (Kc=0.6)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver `LICENSE` file para detalles.

## 🙏 Créditos

- **NASA**: APIs APOD y POWER
- **Open-Meteo**: Datos meteorológicos gratuitos
- **Recharts**: Gráficos interactivos
- **Vite**: Build tool moderno
- **Express**: Framework web para Node.js

---

🌱 **¡Feliz coding y que tus plantas estén siempre bien hidratadas!** 🌱