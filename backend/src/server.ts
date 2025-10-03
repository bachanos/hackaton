import express from 'express';
import cors from 'cors';

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

// Middleware
app.use(cors());
app.use(express.json());

// Coordenadas por defecto (EINA Zaragoza - 41°41'01"N 0°53'17"O)
const DEFAULT_LATITUDE = 41.6836;
const DEFAULT_LONGITUDE = -0.8881;
const POT_DIAMETER_CM = 10;

// Coeficientes de cultivo (Kc) para diferentes plantas
const PLANT_COEFFICIENTS = {
  menta: { kc: 1.2, name: '🌿 Menta', description: 'Necesita mucha agua, hojas jugosas' },
  romero: { kc: 0.6, name: '🌱 Romero', description: 'Resistente a sequía, aromática mediterránea' }
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

// Endpoint principal: Cálculo de riego
app.get('/api/watering-calculation', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || DEFAULT_LATITUDE;
    const lon = parseFloat(req.query.lon as string) || DEFAULT_LONGITUDE;
    const plantType = (req.query.plant as string) || 'menta';
    
    // Validar tipo de planta
    const plantData = PLANT_COEFFICIENTS[plantType as keyof typeof PLANT_COEFFICIENTS] || PLANT_COEFFICIENTS.menta;

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
          coefficient: plantData.kc
        },
        calculation: {
          totalET0: totalET, // ET₀ de referencia
          etcPlant: etcPlant, // ETc específica de la planta
          surfaceM2,
          requiredLitres,
          plantCoefficient: plantData.kc
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
      waterNeed: value.kc > 1 ? 'Alta' : value.kc > 0.8 ? 'Media' : 'Baja'
    }))
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
