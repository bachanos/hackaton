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
  const [visionLoading, setVisionLoading] = useState(false);
  const [lastDetection, setLastDetection] = useState<any>(null);
  const [visionStatus, setVisionStatus] = useState<string>('disconnected');
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [aiMode, setAiMode] = useState<string>('mock');
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Cargar imagen NASA APOD y plantas al inicio
  useEffect(() => {
    fetchApod();
    fetchPlants();
    checkVisionStatus();
    enumerateCameras();
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

  const checkVisionStatus = async () => {
    try {
      const response = await axios.get('/api/plant-status');
      setVisionStatus(response.data.status);
    } catch (error) {
      console.error('Error checking vision status:', error);
      setVisionStatus('disconnected');
    }
  };

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);

      // Seleccionar primera cámara por defecto si no hay ninguna seleccionada
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }

      console.log('📹 Cámaras disponibles:', videoDevices.map(cam => cam.label || 'Cámara sin nombre'));
    } catch (error) {
      console.error('Error enumerando cámaras:', error);
    }
  };

  const detectPlantWithCamera = async () => {
    setVisionLoading(true);
    setError(null); // Limpiar errores previos

    // Capturar imagen actual de la webcam
    const imageData = captureImage();
    if (!imageData) {
      setError('❌ No se pudo capturar imagen de la cámara');
      setVisionLoading(false);
      return;
    }

    setCapturedImage(imageData);

    // Generar timestamp y descargar automáticamente
    const timestamp = generateTimestamp();
    downloadImage(imageData, timestamp);
    console.log(`📸 Imagen guardada: plant_detection_${timestamp}.png`);

    try {
      // Enviar solicitud de clasificación
      const response = await axios.post('/api/classify-plant', {
        image: imageData // Enviar la imagen capturada
      });

      if (response.data.plant_used) {
        setSelectedPlant(response.data.plant_used);
        setLastDetection({
          plant: response.data.detected,
          confidence: response.data.confidence,
          timestamp: response.data.timestamp
        });

        // Limpiar error en caso de éxito
        setError(null);

        // Automáticamente recalcular el riego con la nueva planta
        setTimeout(() => {
          fetchWateringData();
        }, 500);
      }

    } catch (error: any) {
      console.error('Error en detección de planta:', error);

      // Mostrar error específico según el tipo
      if (error.response?.status === 413) {
        setError('❌ Imagen demasiado grande. Intenta con menor resolución.');
      } else if (error.response?.status >= 500) {
        setError('❌ Error del servidor. Verifica que los servicios estén activos.');
      } else if (error.response?.status === 400) {
        setError('❌ Error en el formato de la imagen.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('❌ Error de conexión. Verifica que el backend esté funcionando.');
      } else {
        setError(`❌ Error en detección: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setVisionLoading(false);
    }
  };

  const startWebcam = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setWebcamStream(stream);
      setWebcamActive(true);
      setVisionStatus('connected');
    } catch (error) {
      console.error('Error accediendo a la webcam:', error);
      setVisionStatus('disconnected');
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
      setWebcamActive(false);
      setVisionStatus('disconnected');
    }
  };

  // Función para generar timestamp human-friendly
  const generateTimestamp = (): string => {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${dayName}-${day}-${month}-${hours}${minutes}`;
  };

  // Función para descargar imagen automáticamente
  const downloadImage = (imageData: string, timestamp: string) => {
    const link = document.createElement('a');
    link.download = `plant_detection_${timestamp}.png`;
    link.href = imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para capturar imagen de la webcam
  const captureImage = (): string | null => {
    const video = document.querySelector('video.webcam-feed') as HTMLVideoElement;
    if (!video || !webcamActive) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/png');
  };

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

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

            {/* Panel de detección automática */}
            <div className="vision-panel">
              <h4>📹 Detección Automática con IA</h4>
              <div className="vision-content">
                <div className="camera-preview-container">
                  <div className="webcam-container">
                    {webcamActive && webcamStream ? (
                      <video
                        ref={(video) => {
                          if (video && webcamStream) {
                            video.srcObject = webcamStream;
                          }
                        }}
                        autoPlay
                        muted
                        className="webcam-feed"
                      />
                    ) : (
                      <div className="webcam-placeholder">
                        <div className="camera-icon">📷</div>
                        <p>Cámara desconectada</p>
                      </div>
                    )}
                    <div className="camera-label">📹 Video en tiempo real</div>
                  </div>

                  <div className="captured-image-container">
                    {capturedImage ? (
                      <img
                        src={capturedImage}
                        alt="Imagen capturada"
                        className="captured-image"
                      />
                    ) : (
                      <div className="capture-placeholder">
                        <div className="capture-icon">📸</div>
                        <p>Imagen capturada aparecerá aquí</p>
                      </div>
                    )}
                    <div className="camera-label">📸 Última captura</div>
                  </div>
                </div>

                {/* Selector de cámara */}
                <div className="camera-selector">
                  <label htmlFor="camera-select">📹 Seleccionar cámara:</label>
                  <select
                    id="camera-select"
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    disabled={webcamActive}
                    className="camera-dropdown"
                  >
                    {availableCameras.map((camera, index) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Cámara ${index + 1}`}
                      </option>
                    ))}
                  </select>
                  {webcamActive && (
                    <p className="camera-hint">💡 Para cambiar cámara, para primero la actual</p>
                  )}
                </div>

                <div className="vision-controls">
                  <button
                    className={`vision-btn ${webcamActive ? 'stop' : 'start'}`}
                    onClick={webcamActive ? stopWebcam : startWebcam}
                  >
                    {webcamActive ? '⏹️ Parar Cámara' : '▶️ Iniciar Cámara'}
                  </button>

                  <button
                    className="vision-btn detect"
                    onClick={detectPlantWithCamera}
                    disabled={visionLoading || !webcamActive}
                  >
                    {visionLoading ? '🔍 Detectando...' : '📸 Detectar Planta'}
                  </button>
                </div>

                <div className="vision-status">
                  <span className={`status-indicator ${webcamActive ? 'connected' : 'disconnected'}`}>
                    {webcamActive ? '🟢 Cámara activa' : '🔴 Cámara inactiva'}
                  </span>
                  {lastDetection && (
                    <div className="last-detection">
                      <span className="detection-result">
                        Última detección: {lastDetection.plant} ({(lastDetection.confidence * 100).toFixed(1)}%)
                      </span>
                      <span className="detection-time">
                        {new Date(lastDetection.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Mostrar errores */}
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {!webcamActive && (
                  <p className="vision-help">
                    💡 Para detectar plantas:
                    <br />1. Haz clic en "Iniciar Cámara"
                    <br />2. Apunta a tu planta y haz clic en "Detectar Planta"
                    <br />3. El sistema identificará automáticamente el tipo
                  </p>
                )}
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