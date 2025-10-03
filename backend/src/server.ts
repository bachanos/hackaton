import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '../.env' });

// Interfaces para tipar las respuestas de las APIs
interface OpenMeteoResponse {
  hourly: {
    et0_fao_evapotranspiration: number[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    time: string[];
  };
  current_weather: {
    temperature: number;
  };
}

interface NasaApodResponse {
  title: string;
  explanation: string;
  url: string;
  media_type: string;
  date: string;
}

const app = express();
const PORT = 3001;

// Configuración del servicio de IA
const AI_CONFIG = {
  // Cambiar entre 'mock' y 'roboflow'
  mode: process.env.AI_MODE || 'mock',

  // URLs de servicios
  mockUrl: 'http://localhost:5001/classify',
  roboflowUrl: 'https://detect.roboflow.com/plant-detection-jxwat/1',
  roboflowApiKey: process.env.ROBOFLOW_API_KEY || '',

  // Configuraciones adicionales
  timeout: 10000, // 10 segundos
  retryWithMock: true, // Si Roboflow falla, usar mock como fallback
};

// Middleware
app.use(cors());
app.use(express.json());

// Coordenadas por defecto (EINA Zaragoza - 41°41'01"N 0°53'17"O)
const DEFAULT_LATITUDE = 41.6836;
const DEFAULT_LONGITUDE = -0.8881;
const POT_DIAMETER_CM = 10;

// Coeficientes de cultivo (Kc) para diferentes plantas
const PLANT_COEFFICIENTS = {
  menta: {
    kc: 1.2,
    name: '🌿 Menta',
    description: 'Necesita mucha agua, hojas jugosas',
  },
  romero: {
    kc: 0.6,
    name: '🌱 Romero',
    description: 'Resistente a sequía, aromática mediterránea',
  },
};

// Cache simple para evitar muchas llamadas a las APIs
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Funciones para servicios de IA
const callMockService = async (imageData: any) => {
  console.log('🤖 Usando servicio Mock AI...');
  const response = await fetch(AI_CONFIG.mockUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(imageData),
    signal: AbortSignal.timeout(AI_CONFIG.timeout),
  });

  if (!response.ok) {
    throw new Error(`Mock service error: ${response.status}`);
  }

  return await response.json();
};

const callRoboflowService = async (imageData: any) => {
  console.log('🚀 Usando Roboflow AI Service...');

  if (!AI_CONFIG.roboflowApiKey) {
    throw new Error('Roboflow API key not configured');
  }

  // Convertir imagen a formato que espera Roboflow
  const roboflowData = {
    image: imageData.image || imageData, // Asumiendo que viene en base64
  };

  const response = await fetch(
    `${AI_CONFIG.roboflowUrl}?api_key=${AI_CONFIG.roboflowApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roboflowData),
      signal: AbortSignal.timeout(AI_CONFIG.timeout),
    }
  );

  if (!response.ok) {
    throw new Error(`Roboflow service error: ${response.status}`);
  }

  const result = (await response.json()) as any;

  // Convertir respuesta de Roboflow al formato esperado
  return {
    top: result.predictions?.[0]?.class || 'romero',
    confidence: result.predictions?.[0]?.confidence || 0.0,
    timestamp: new Date().toISOString(),
    service: 'roboflow',
    raw_response: result,
  };
};

const classifyPlant = async (imageData: any) => {
  try {
    if (AI_CONFIG.mode === 'roboflow') {
      try {
        return await callRoboflowService(imageData);
      } catch (error) {
        console.warn('⚠️ Roboflow service failed:', error);

        if (AI_CONFIG.retryWithMock) {
          console.log('🔄 Fallback to mock service...');
          const mockResult = (await callMockService(imageData)) as any;
          return { ...mockResult, fallback: true };
        }
        throw error;
      }
    } else {
      return await callMockService(imageData);
    }
  } catch (error) {
    console.error('❌ Plant classification failed:', error);
    throw error;
  }
};

// Endpoint principal: Cálculo de riego
app.get('/api/watering-calculation', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || DEFAULT_LATITUDE;
    const lon = parseFloat(req.query.lon as string) || DEFAULT_LONGITUDE;
    const plantType = (req.query.plant as string) || 'menta';

    // Validar tipo de planta
    const plantData =
      PLANT_COEFFICIENTS[plantType as keyof typeof PLANT_COEFFICIENTS] ||
      PLANT_COEFFICIENTS.menta;

    const cacheKey = `watering-${lat}-${lon}-${plantType}`;
    let data = getCachedData(cacheKey);

    if (!data) {
      console.log('Fetching fresh data from Open-Meteo...');

      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=et0_fao_evapotranspiration,temperature_2m,relative_humidity_2m&current_weather=true&timezone=auto`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch data from Open-Meteo');
      }

      const weatherData = (await response.json()) as OpenMeteoResponse;

      // Calcular evapotranspiración para las próximas 24 horas
      const hourlyET: number[] =
        weatherData.hourly.et0_fao_evapotranspiration.slice(0, 24);
      const totalET = hourlyET.reduce(
        (sum: number, val: number) => sum + (val || 0),
        0
      );

      // Calcular ml necesarios aplicando coeficiente de la planta
      const radiusM = POT_DIAMETER_CM / 2 / 100;
      const surfaceM2 = Math.PI * Math.pow(radiusM, 2);
      const etcPlant = totalET * plantData.kc; // ET con coeficiente de cultivo
      const requiredLitres = etcPlant * surfaceM2;
      const requiredMl = Math.round(requiredLitres * 1000);

      data = {
        requiredMl,
        currentTemp: weatherData.current_weather.temperature,
        currentHumidity: weatherData.hourly.relative_humidity_2m[0],
        hourlyForecast: {
          temperatures: weatherData.hourly.temperature_2m.slice(0, 24),
          humidity: weatherData.hourly.relative_humidity_2m.slice(0, 24),
          times: weatherData.hourly.time.slice(0, 24),
        },
        location: { lat, lon },
        potSize: POT_DIAMETER_CM,
        plant: {
          type: plantType,
          name: plantData.name,
          description: plantData.description,
          coefficient: plantData.kc,
        },
        calculation: {
          totalET0: totalET, // ET₀ de referencia
          etcPlant: etcPlant, // ETc específica de la planta
          surfaceM2,
          requiredLitres,
          plantCoefficient: plantData.kc,
        },
      };

      setCachedData(cacheKey, data);
    }

    res.json(data);
  } catch (error) {
    console.error('Error in watering calculation:', error);
    res.status(500).json({ error: 'Error processing your request' });
  }
});

// Endpoint para obtener tipos de plantas disponibles
app.get('/api/plants', (req, res) => {
  res.json({
    plants: Object.entries(PLANT_COEFFICIENTS).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description,
      coefficient: value.kc,
      waterNeed: value.kc > 1 ? 'Alta' : value.kc > 0.8 ? 'Media' : 'Baja',
    })),
  });
});

// Endpoint para clasificación de plantas via IA (Híbrido: Mock + Roboflow)
app.post('/api/classify-plant', async (req, res) => {
  try {
    console.log(`🤖 Clasificando planta usando modo: ${AI_CONFIG.mode}`);

    // Usar el sistema híbrido de clasificación
    const aiResult = await classifyPlant(req.body);
    const detectedPlant = aiResult.top || 'romero';
    const confidence = aiResult.confidence || 0.0;

    // Verificar si la planta detectada existe en nuestro sistema
    const plantExists = detectedPlant in PLANT_COEFFICIENTS;
    const finalPlant = plantExists ? detectedPlant : 'romero';

    if (!plantExists) {
      console.log(
        `⚠️ Planta '${detectedPlant}' no reconocida, usando romero por defecto`
      );
    }

    const result = {
      detected: detectedPlant,
      confidence: confidence,
      plant_used: finalPlant,
      plant_info:
        PLANT_COEFFICIENTS[finalPlant as keyof typeof PLANT_COEFFICIENTS],
      ai_response: aiResult,
      service_used: aiResult.service || AI_CONFIG.mode,
      fallback_used: aiResult.fallback || false,
      timestamp: new Date().toISOString(),
    };

    console.log(
      `🌿 IA detectó: ${detectedPlant} (${(confidence * 100).toFixed(
        1
      )}%) -> Usando: ${finalPlant}`
    );
    res.json(result);
  } catch (error) {
    console.error('Error en clasificación de planta:', error);
    res.status(500).json({
      error: 'Error al clasificar la planta',
      fallback: {
        detected: 'romero',
        confidence: 0.5,
        plant_used: 'romero',
        plant_info: PLANT_COEFFICIENTS.romero,
      },
    });
  }
});

// Endpoint para obtener última clasificación del servicio Python
app.get('/api/plant-status', async (req, res) => {
  try {
    const PLANT_VISION_HEALTH_URL = 'http://localhost:5001/health';

    const response = await fetch(PLANT_VISION_HEALTH_URL);
    const healthData = (await response.json()) as any;

    res.json({
      vision_service: healthData,
      backend_plants: Object.keys(PLANT_COEFFICIENTS),
      status: 'connected',
    });
  } catch (error) {
    console.error('Error conectando con Plant Vision:', error);
    res.json({
      vision_service: null,
      backend_plants: Object.keys(PLANT_COEFFICIENTS),
      status: 'disconnected',
      error: 'Plant Vision service no disponible',
    });
  }
});

// Endpoint para cambiar el modo de IA (mock/roboflow)
app.post('/api/ai-mode', (req, res) => {
  const { mode } = req.body;

  if (!mode || !['mock', 'roboflow'].includes(mode)) {
    return res.status(400).json({
      error: 'Modo inválido. Usar "mock" o "roboflow"',
    });
  }

  AI_CONFIG.mode = mode;
  console.log(`🔄 Modo de IA cambiado a: ${mode}`);

  res.json({
    message: `Modo cambiado a ${mode}`,
    currentMode: AI_CONFIG.mode,
    roboflowConfigured: !!AI_CONFIG.roboflowApiKey,
  });
});

// Endpoint para obtener configuración actual del sistema IA
app.get('/api/ai-status', (req, res) => {
  res.json({
    currentMode: AI_CONFIG.mode,
    availableModes: ['mock', 'roboflow'],
    roboflowConfigured: !!AI_CONFIG.roboflowApiKey,
    mockServiceUrl: AI_CONFIG.mockUrl,
    roboflowUrl: AI_CONFIG.roboflowUrl,
    retryWithMock: AI_CONFIG.retryWithMock,
  });
});

// Endpoint NASA APOD (Astronomy Picture of the Day)
app.get('/api/apod', async (req, res) => {
  try {
    const cacheKey = 'apod-today';
    let data = getCachedData(cacheKey);

    if (!data) {
      console.log('Fetching NASA APOD...');

      const NASA_API_KEY = 'DEMO_KEY'; // Para producción usar una API key real
      const response = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch NASA APOD');
      }

      const apodData = (await response.json()) as NasaApodResponse;

      data = {
        title: apodData.title,
        explanation: apodData.explanation,
        url: apodData.url,
        mediaType: apodData.media_type,
        date: apodData.date,
      };

      // Cache por 24 horas para APOD
      cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching NASA APOD:', error);
    res.status(500).json({ error: 'Error fetching NASA image' });
  }
});

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    cache_size: cache.size,
  });
});

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/dist'));

  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: '../frontend/dist' });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET /api/watering-calculation?lat=40.4168&lon=-3.7038`);
  console.log(`   GET /api/apod`);
  console.log(`   GET /api/health`);
});
