import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '../.env' });

import { getTemperatureData } from './nasa-power';

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
  roboflowUrl: 'https://classify.roboflow.com/hierbasclasificacion-1zi8c/4',
  roboflowApiKey: process.env.ROBOFLOW_API_KEY || '',

  // Configuraciones adicionales
  timeout: 10000, // 10 segundos
  retryWithMock: true, // Si Roboflow falla, usar mock como fallback
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentar límite para imágenes
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
  let imageBase64 = imageData.image || imageData;

  console.log(
    '🔍 Imagen original recibida (primeros 50 chars):',
    typeof imageBase64 === 'string'
      ? imageBase64.substring(0, 50)
      : 'No es string'
  );

  // Roboflow quiere SOLO base64 puro, sin prefijos
  if (typeof imageBase64 === 'string' && imageBase64.startsWith('data:image')) {
    // Quitar el prefijo data URL si existe
    imageBase64 = imageBase64.split(',')[1];
    console.log('📤 Removido prefijo data URL');
  }

  console.log(
    '📤 Enviando a Roboflow imagen de tamaño:',
    imageBase64 ? imageBase64.length : 0
  );
  console.log(
    '📤 Formato final (primeros 50 chars):',
    imageBase64.substring(0, 50)
  );

  const response = await fetch(
    `${AI_CONFIG.roboflowUrl}?api_key=${AI_CONFIG.roboflowApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: imageBase64, // Enviar base64 directamente, no JSON
      signal: AbortSignal.timeout(AI_CONFIG.timeout),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.log('❌ Error de Roboflow:', response.status, errorText);
    throw new Error(
      `Roboflow service error: ${response.status} - ${errorText}`
    );
  }

  const result = (await response.json()) as any;

  console.log('🔍 Respuesta RAW de Roboflow:', JSON.stringify(result, null, 2));

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

// TEMPORAL: Endpoint simplificado para debugging - llamar directamente a Roboflow
app.post('/api/classify-plant', async (req, res) => {
  try {
    console.log('🔍 DEBUGGING: Llamando directamente a Roboflow...');

    // Llamar directamente a Roboflow sin fallbacks
    const roboflowResult = await callRoboflowService(req.body);

    console.log(
      '🔍 DEBUGGING: Respuesta de Roboflow:',
      JSON.stringify(roboflowResult, null, 2)
    );

    // Devolver la respuesta RAW de Roboflow para debugging
    res.json({
      debug_mode: true,
      roboflow_raw_response: roboflowResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ DEBUGGING: Error directo de Roboflow:', error);
    res.status(500).json({
      debug_mode: true,
      error: error.message || 'Error desconocido',
      error_details: error,
      timestamp: new Date().toISOString(),
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

app.get('/api/temperature-alert', async (req, res) => {
  const lat = parseFloat(req.query.lat as string) || 41.6836; // Coordenadas de EINA por defecto
  const lon = parseFloat(req.query.lon as string) || -0.8881;

  try {
    const temperatureData = await getTemperatureData(lat, lon);

    // Lógica simple de alerta: si algún día la temperatura media fue < 5°C
    const isColdAlert = temperatureData.some(
      (day: { temp_avg: number }) => day.temp_avg < 5
    );
    const message = isColdAlert
      ? '¡Alerta! Se han registrado temperaturas muy frías en los últimos 7 días.'
      : 'Las temperaturas han sido moderadas en los últimos 7 días.';

    res.json({
      location: { lat, lon },
      alert: {
        isAlert: isColdAlert,
        message: message,
      },
      data: temperatureData,
    });
  } catch (error) {
    console.error('❌ Error al generar la alerta de temperatura:', error);
    res
      .status(500)
      .json({
        error: 'No se pudieron obtener los datos de temperatura de la NASA.',
      });
  }
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
