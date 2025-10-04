import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import UnifiedQuiz from './UnifiedQuiz';
import IrrigationExplanation from './IrrigationExplanation';

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







// Función para mapear los valores de detección a los formatos esperados por el quiz
const mapDetectedPlantToQuizFormat = (detectedPlant: string): string => {
  const plantMapping: { [key: string]: string } = {
    'mint': 'menta',
    'menta': 'menta',
    'romeri': 'romero',
    'romero': 'romero',
    'rosemary': 'romero'
  };
  
  const mapped = plantMapping[detectedPlant.toLowerCase()] || 'romero';
  console.log(`🔄 Mapeo de planta: "${detectedPlant}" → "${mapped}"`);
  return mapped;
};

function App() {
  const [wateringData, setWateringData] = useState<WateringData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState('menta');

  // Coordenadas fijas para EINA
  const coordinates = { lat: 41.6836, lon: -0.8881 };
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
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    checkVisionStatus();
    enumerateCameras();
    fetchWateringData(); // Cargar datos iniciales para mostrar la barra superior
  }, []);







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

    try {
      // Usar nuestro backend con formato correcto
      console.log('� Enviando a nuestro backend...');

      const response = await axios.post('/api/classify-plant', {
        image: imageData // Enviar imagen completa con data:image prefix
      });

      console.log('🔍 Respuesta del backend:', response.data);

      // Procesar respuesta, compatible con modo debug y normal
      let predictions = [];
      if (response.data.debug_mode && response.data.roboflow_raw_response?.raw_response) {
        predictions = response.data.roboflow_raw_response.raw_response.predictions || [];
      } else if (response.data.predictions) {
        predictions = response.data.predictions;
      }

      if (predictions.length > 0) {
        const topPrediction = predictions[0];
        const detectedPlant = topPrediction.class || 'romero';
        const confidence = topPrediction.confidence || 0.0;

        // Mapear la planta detectada al formato esperado
        const plantToUse = mapDetectedPlantToQuizFormat(detectedPlant);

        setSelectedPlant(plantToUse);
        setLastDetection({
          plant: detectedPlant,
          confidence: confidence,
          timestamp: new Date().toISOString()
        });

        // Abrir automáticamente el modal del quiz cuando se detecta una planta
        setIsQuizModalOpen(true);

        // Limpiar error en caso de éxito
        setError(null);

        console.log(`🌿 Roboflow detectó: ${detectedPlant} (${(confidence * 100).toFixed(1)}%) -> Usando: ${plantToUse}`);
      } else {
        setError('❌ Roboflow no detectó ninguna planta');
      }

      // Siempre recalcular el riego después de capturar una imagen, independientemente de la detección
      setTimeout(() => {
        fetchWateringData();
      }, 500);

    } catch (error: any) {
      console.error('Error en detección de planta:', error);

      // Mostrar error específico según el tipo
      if (error.code === 'ERR_NETWORK') {
        setError('❌ Error CORS: No se puede conectar directamente a Roboflow desde el navegador.');
      } else if (error.response?.status === 413) {
        setError('❌ Imagen demasiado grande. Intenta con menor resolución.');
      } else if (error.response?.status >= 500) {
        setError('❌ Error del servidor Roboflow.');
      } else if (error.response?.status === 400) {
        setError(`❌ Error Roboflow: ${error.response?.data?.message || 'Formato de imagen inválido'}`);
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('❌ Error de conexión con Roboflow.');
      } else {
        setError(`❌ Error en detección: ${error.response?.data?.message || error.message}`);
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





  // Función para capturar imagen de la webcam
  const captureImage = (): string | null => {
    const video = document.querySelector('video.webcam-feed') as HTMLVideoElement;
    if (!video || !webcamActive) return null;

    const canvas = document.createElement('canvas');

    // Limitar tamaño máximo para evitar imágenes demasiado grandes
    const maxWidth = 640;
    const maxHeight = 480;

    let { videoWidth, videoHeight } = video;

    // Redimensionar si es necesario manteniendo proporción
    if (videoWidth > maxWidth || videoHeight > maxHeight) {
      const ratio = Math.min(maxWidth / videoWidth, maxHeight / videoHeight);
      videoWidth = Math.floor(videoWidth * ratio);
      videoHeight = Math.floor(videoHeight * ratio);
    }

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

    // Usar JPEG con calidad reducida para menor tamaño
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    console.log(`📸 Imagen capturada: ${videoWidth}x${videoHeight}, tamaño: ${dataUrl.length} chars`);

    return dataUrl;
  };

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);



  return (
    <div className="app">
      <div className="overlay">
        <header className="header">
          <h1>🌱 Sistema de Riego Automatizado</h1>
          <p>Con tecnología de APIs de la NASA y datos meteorológicos en tiempo real</p>
        </header>

        {/* Información integrada: ubicación + datos meteorológicos */}
        {wateringData && (
          <div className="top-info-bar">
            <div className="location-summary">
              <div className="location-icon">📍</div>
              <div className="location-text">
                <span className="location-name">EINA - Zaragoza</span>
                <span className="location-coords">{coordinates.lat.toFixed(2)}°N {Math.abs(coordinates.lon).toFixed(2)}°O</span>
              </div>
            </div>

            <div className="weather-data">
              <div className="data-item">
                <span className="data-icon">🌡️</span>
                <span className="data-value">{wateringData.currentTemp}°C</span>
              </div>
              <div className="data-item">
                <span className="data-icon">💨</span>
                <span className="data-value">{wateringData.currentHumidity}%</span>
              </div>
              <div className="data-item">
                <span className="data-icon">🧮</span>
                <span className="data-value">{wateringData.calculation.etcPlant.toFixed(2)} mm</span>
              </div>
            </div>
          </div>
        )}

        <main className="main-content">
          {/* Panel de detección automática */}
          <div className="vision-panel">
            <div className="vision-content">
              <div className="vision-layout-centered">
                {/* Cámara centrada */}
                <div className="camera-column-centered">
                  <div className="unified-camera-container">
                    {/* Mostrar imagen capturada si existe, sino mostrar webcam */}
                    {capturedImage ? (
                      <div className="camera-view">
                        <img
                          src={capturedImage}
                          alt="Imagen capturada"
                          className="captured-image-display"
                        />
                        <div className="camera-label">📸 Imagen capturada</div>
                      </div>
                    ) : (
                      <div className="camera-view">
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
                    )}
                  </div>

                  {/* Controles de cámara debajo del cuadro */}
                  <div className="camera-controls">
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

                    {/* Botón para volver a la webcam si hay imagen capturada */}
                    {capturedImage && (
                      <button
                        className="vision-btn back-to-webcam"
                        onClick={() => setCapturedImage(null)}
                      >
                        🔄 Volver a cámara en vivo
                      </button>
                    )}
                  </div>

                  {/* Estado de la cámara */}
                  <div className="camera-status">
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
                </div>
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



          {/* Explicación detallada del cálculo */}
          {wateringData && (
            <IrrigationExplanation wateringData={wateringData} />
          )}



          {/* Modal del Quiz */}
          {isQuizModalOpen && (
            <div className="quiz-modal-overlay" onClick={() => setIsQuizModalOpen(false)}>
              <div className="quiz-modal-content" onClick={(e) => e.stopPropagation()}>
                <button
                  className="quiz-close-btn"
                  onClick={() => setIsQuizModalOpen(false)}
                >
                  ✕
                </button>
                <UnifiedQuiz 
                  capturedImage={capturedImage} 
                  detectedPlant={mapDetectedPlantToQuizFormat(lastDetection.plant)} 
                  onClose={() => setIsQuizModalOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Configuración de cámara */}
          <div className="camera-settings-panel">
            <h4>⚙️ Configuración de Cámara</h4>
            <div className="camera-settings-content">
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
                {availableCameras.length === 0 && (
                  <p className="camera-hint">🔍 Buscando cámaras disponibles...</p>
                )}
              </div>
            </div>
          </div>

        </main>

        <footer className="footer">
          <p>🛰️ Datos meteorológicos: Open-Meteo</p>
        </footer>
      </div>
    </div>
  );
}

export default App;