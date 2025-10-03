import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

interface WateringData {
  requiredMl: number;
  currentTemp: number;
  currentHumidity: number;
  hourlyForecast: {
    temperatures: number[];
    humidity: number[];
    times: string[];
  };
  location: { lat: number; lon: number };
  potSize: number;
  plant: {
    type: string;
    name: string;
    description: string;
    coefficient: number;
  };
  calculation: {
    totalET0: number;
    etcPlant: number;
    surfaceM2: number;
    requiredLitres: number;
    plantCoefficient: number;
  };
}

interface ApodData {
  title: string;
  explanation: string;
  url: string;
  mediaType: string;
  date: string;
}

interface Plant {
  id: string;
  name: string;
  description: string;
  coefficient: number;
  waterNeed: string;
}

function App() {
  const [wateringData, setWateringData] = useState<WateringData | null>(null);
  const [apodData, setApodData] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 41.6836, lon: -0.8881 });
  const [selectedPlant, setSelectedPlant] = useState('menta');
  const [plants, setPlants] = useState<Plant[]>([]);

  // Cargar imagen NASA APOD y plantas al inicio
  useEffect(() => {
    fetchApod();
    fetchPlants();
  }, []);

  const fetchApod = async () => {
    try {
      const response = await axios.get('/api/apod');
      setApodData(response.data);
    } catch (error) {
      console.error('Error fetching NASA APOD:', error);
    }
  };

  const fetchPlants = async () => {
    try {
      const response = await axios.get('/api/plants');
      setPlants(response.data.plants);
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const fetchWateringData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/watering-calculation?lat=${coordinates.lat}&lon=${coordinates.lon}&plant=${selectedPlant}`);
      setWateringData(response.data);
    } catch (error) {
      console.error('Error fetching watering data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para el gráfico
  const chartData = wateringData?.hourlyForecast.temperatures.map((temp, index) => ({
    hour: new Date(wateringData.hourlyForecast.times[index]).getHours(),
    temperature: temp,
    humidity: wateringData.hourlyForecast.humidity[index]
  })) || [];

  return (
    <div className="app" style={{
      backgroundImage: apodData?.mediaType === 'image' ? `url(${apodData.url})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="overlay">
        <header className="header">
          <h1>🌱 Sistema de Riego Automatizado</h1>
          <p>Con tecnología de APIs de la NASA y datos meteorológicos en tiempo real</p>
        </header>

        <main className="main-content">
          {/* Panel de configuración */}
          <div className="config-panel">
            <h3>📍 Ubicación del Riego</h3>
            <div className="location-info">
              <div className="default-location">
                <h4>🏛️ Edificio EINA - Universidad de Zaragoza</h4>
                <p className="location-details">
                  📐 41°41'01"N 0°53'17"O • 🎓 Escuela de Ingeniería y Arquitectura
                </p>
                <p className="coords-display">
                  📊 Lat: {coordinates.lat.toFixed(4)}° | Lon: {coordinates.lon.toFixed(4)}°
                </p>
              </div>
            </div>
            
            {/* Selector de plantas */}
            <div className="plant-selector">
              <h4>🌿 Tipo de Planta</h4>
              <div className="plant-options">
                {plants.map((plant) => (
                  <button
                    key={plant.id}
                    className={`plant-btn ${selectedPlant === plant.id ? 'active' : ''}`}
                    onClick={() => setSelectedPlant(plant.id)}
                  >
                    <div className="plant-name">{plant.name}</div>
                    <div className="plant-info">
                      <span className="plant-desc">{plant.description}</span>
                      <span className={`water-badge ${plant.waterNeed.toLowerCase()}`}>
                        {plant.waterNeed} agua
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="coordinates">
              <label>
                🌍 Latitud:
                <input
                  type="number"
                  step="0.0001"
                  value={coordinates.lat}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                  placeholder="41.6836"
                />
              </label>
              <label>
                🌍 Longitud:
                <input
                  type="number"
                  step="0.0001"
                  value={coordinates.lon}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, lon: parseFloat(e.target.value) }))}
                  placeholder="-0.8881"
                />
              </label>
            </div>
            <div className="action-buttons">
              <button
                className="reset-btn"
                onClick={() => setCoordinates({ lat: 41.6836, lon: -0.8881 })}
                type="button"
              >
                🏛️ Volver a EINA
              </button>
              <button
                className="calculate-btn"
                onClick={fetchWateringData}
                disabled={loading}
              >
                {loading ? '🔄 Calculando...' : '💧 Calcular Riego Necesario'}
              </button>
            </div>
          </div>

          {/* Resultados principales */}
          {wateringData && (
            <div className="results-grid">
              <div className="result-card main-result">
                <h2>💧 Agua Necesaria Hoy</h2>
                <div className="big-number">{wateringData.requiredMl} ml</div>
                <p>Para {wateringData.plant.name} en maceta de {wateringData.potSize}cm</p>
                <div className="plant-summary">
                  <span className="plant-coeff">Coeficiente: {wateringData.plant.coefficient}</span>
                  <span className="plant-desc-small">{wateringData.plant.description}</span>
                </div>
              </div>

              <div className="result-card">
                <h3>🌡️ Temperatura Actual</h3>
                <div className="number">{wateringData.currentTemp}°C</div>
              </div>

              <div className="result-card">
                <h3>💨 Humedad Relativa</h3>
                <div className="number">{wateringData.currentHumidity}%</div>
              </div>

              <div className="result-card">
                <h3>🧮 Evapotranspiración</h3>
                <div className="number">{wateringData.calculation.etcPlant.toFixed(2)} mm</div>
                <small>{wateringData.plant.name} (Kc: {wateringData.plant.coefficient})</small>
              </div>
            </div>
          )}

          {/* Gráfico de temperatura */}
          {wateringData && (
            <div className="chart-container">
              <h3>📊 Previsión de Temperatura (24h)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis
                    dataKey="hour"
                    stroke="white"
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis stroke="white" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    labelFormatter={(hour) => `Hora: ${hour}:00`}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ff6b6b"
                    strokeWidth={3}
                    name="Temperatura (°C)"
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#4ecdc4"
                    strokeWidth={2}
                    name="Humedad (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Panel NASA APOD */}
          {apodData && (
            <div className="apod-panel">
              <h3>🚀 NASA - Imagen Astronómica del Día</h3>
              <div className="apod-content">
                <h4>{apodData.title}</h4>
                <p className="apod-date">📅 {apodData.date}</p>
                {apodData.mediaType === 'image' && (
                  <img
                    src={apodData.url}
                    alt={apodData.title}
                    className="apod-thumbnail"
                  />
                )}
                <p className="apod-explanation">
                  {apodData.explanation.substring(0, 200)}...
                </p>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>🛰️ Datos meteorológicos: Open-Meteo | 🚀 Imágenes: NASA APOD API</p>
        </footer>
      </div>
    </div>
  );
}

export default App;