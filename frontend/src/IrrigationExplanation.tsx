import React, { useState, useEffect } from "react";
import "./IrrigationExplanation.css";

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

interface IrrigationExplanationProps {
  wateringData: WateringData;
  onClose: () => void;
}

const IrrigationExplanation: React.FC<IrrigationExplanationProps> = ({
  wateringData,
  onClose,
}) => {
  const [soilMoisture, setSoilMoisture] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHumidity = async () => {
      try {
        const response = await fetch("http://localhost:5001/humidity");
        const data = await response.json();
        setSoilMoisture(data.humidity);
      } catch (error) {
        console.error("Error fetching humidity:", error);
        setSoilMoisture(0); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchHumidity();
  }, []);

  const getSoilStatus = (moisture: number) => {
    if (moisture < 30) return { status: "SECO", color: "#ff6b6b", emoji: "🔴" };
    if (moisture < 60)
      return { status: "ÓPTIMO", color: "#4ecdc4", emoji: "✅" };
    return { status: "SATURADO", color: "#45b7d1", emoji: "💧" };
  };

  if (loading || soilMoisture === null) {
    return (
      <div className="irrigation-explanation">
        <button className="explanation-close-btn" onClick={onClose}>
          ✕
        </button>
        <div>Cargando datos del sensor de humedad...</div>
      </div>
    );
  }

  const soilStatus = getSoilStatus(soilMoisture);
  const shouldWater = soilMoisture < 30;
  const theoreticalWaterNeed = Math.round(
    wateringData.calculation.requiredLitres * 1000
  ); // ml

  const potRadius = wateringData.potSize / 2;
  const potSurfaceCm2 = Math.round(Math.PI * potRadius * potRadius);

  const rainProbability = 10;
  const expectedRain = 0;

  return (
    <div className="irrigation-explanation">
      <button className="explanation-close-btn" onClick={onClose}>
        ✕
      </button>

      <div className="explanation-header">
        <h2>🧠 CÓMO CALCULAMOS TU RIEGO HOY</h2>
      </div>

      <div className="calculation-flow">
        {/* Factores de cálculo */}
        <div className="calculation-factors">
          <div className="factor-card climate">
            <div className="factor-icon">☀️</div>
            <div className="factor-title">CLIMA</div>
            <div className="factor-value">
              ET₀: {wateringData.calculation.totalET0.toFixed(1)}
            </div>
            <div className="factor-unit">mm</div>
          </div>

          <div className="multiply-symbol">×</div>

          <div className="factor-card plant">
            <div className="factor-icon">🌿</div>
            <div className="factor-title">PLANTA</div>
            <div className="factor-value">
              Kc: {wateringData.plant.coefficient}
            </div>
            <div className="factor-unit">({wateringData.plant.name})</div>
          </div>

          <div className="multiply-symbol">×</div>

          <div className="factor-card pot">
            <div className="factor-icon">📏</div>
            <div className="factor-title">MACETA</div>
            <div className="factor-value">ø {wateringData.potSize} cm</div>
            <div className="factor-unit">{potSurfaceCm2} cm²</div>
          </div>

          <div className="equals-symbol">=</div>
        </div>

        {/* Demanda teórica */}
        <div className="theoretical-demand">
          <div className="demand-arrow">⬇️ DEMANDA TEÓRICA</div>
          <div className="demand-value">
            💧 {theoreticalWaterNeed} ml (cuando esté seco)
          </div>
        </div>

        {/* Estado actual del sustrato */}
        <div className="soil-status-panel">
          <div className="panel-header">💧 ESTADO ACTUAL DEL SUSTRAO</div>
          <div className="panel-content">
            <div className="sensor-reading">
              📡 Sensor de humedad: {soilMoisture.toFixed(2)}%
            </div>

            <div className="moisture-bar-container">
              <div className="moisture-bar">
                <div
                  className="moisture-fill"
                  style={{
                    width: `${soilMoisture}%`,
                    backgroundColor: soilStatus.color,
                  }}
                ></div>
                <div className="moisture-markers">
                  <span className="marker" style={{ left: "0%" }}>
                    0%
                  </span>
                  <span className="marker" style={{ left: "30%" }}>
                    30%
                  </span>
                  <span className="marker" style={{ left: "60%" }}>
                    60%
                  </span>
                  <span className="marker" style={{ left: "100%" }}>
                    100%
                  </span>
                </div>
                <div className="moisture-labels">
                  <span className="label" style={{ left: "15%" }}>
                    SECO
                  </span>
                  <span className="label" style={{ left: "45%" }}>
                    ÓPTIMO
                  </span>
                  <span className="label" style={{ left: "80%" }}>
                    SATURADO
                  </span>
                </div>
              </div>
            </div>

            <div className="soil-conclusion">
              <div className="soil-state">
                {soilStatus.emoji} Estado: <strong>{soilStatus.status}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Lluvia prevista */}
        <div className="rain-forecast">
          <div className="rain-header">☔ LLUVIA PREVISTA</div>
          <div className="rain-content">
            <div className="rain-info">
              Próximas 12h: {expectedRain} mm (Prob: {rainProbability}%)
            </div>
            <div className="rain-adjustment">→ Sin ajuste necesario</div>
          </div>
        </div>

        {/* Decisión final */}
        {/* <div className="final-decision"> */}
        {/* <div className="decision-arrow">⬇️ DECISIÓN FINAL</div> */}
        {/* <div className="decision-result">
            {shouldWater ? (
              <div className="decision-action water">
                🚨 {theoreticalWaterNeed} ml - REGAR AHORA (sustrato seco)
              </div>
            ) : (
              <>
                <div className="decision-action no-water">
                  🚫 0 ml - NO REGAR (sustrato húmedo)
                </div>
                <div className="decision-note">
                  Cuando llegue a 30% → Regar {theoreticalWaterNeed} ml
                </div>
              </>
            )}
          </div> */}
        {/* </div> */}
      </div>
    </div>
  );
};

export default IrrigationExplanation;
