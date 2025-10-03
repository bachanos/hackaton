# 🤖 Plant Vision - Clasificador IA de Plantas

Servicio de clasificación de plantas usando cámara web e inteligencia artificial. Integrado con el MVP de riego automatizado.

## 🍎 Mi Configuración macOS

### Hardware y Software usado:
- **Máquina**: MacBook (mi setup de desarrollo)
- **OS**: macOS (versión actual del sistema)
- **Python**: 3.8+ (verificar con `python3 --version`)
- **Cámaras disponibles**:
  - Built-in webcam (índice 0)
  - GoPro via USB (índice 1) - para futuras pruebas
- **Resolución**: 640x480 por defecto (configurable)

### Comandos específicos para mi Mac:
```bash
# Verificar Python disponible
python3 --version

# Si necesito instalar Python más reciente
brew install python@3.11

# Instalar dependencias en mi máquina
pip3 install -r requirements.txt

# Ejecutar servicios desde directorio raíz del proyecto
python3 plant-vision/mock_ai_server.py
python3 plant-vision/webcam_capture.py
```

### Cámaras en mi Mac:
```bash
# Listar dispositivos de video disponibles
ls /dev/video* 2>/dev/null || echo "En Mac usar índices 0,1,2..."

# Probar qué cámaras funcionan
python3 -c "import cv2; print([cv2.VideoCapture(i).isOpened() for i in range(3)])"
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias de Python
```bash
cd plant-vision
pip install -r requirements.txt
```

### 2. Ejecutar servicios en orden

#### Terminal 1 - Servicio IA Mock (Puerto 5000)
```bash
python mock_ai_server.py
```

#### Terminal 2 - Backend Principal (Puerto 3001)
```bash
cd ..
npm run dev:backend
```

#### Terminal 3 - Frontend (Puerto 3000)
```bash
npm run dev:frontend
```

#### Terminal 4 - Captura de Webcam (Opcional)
```bash
python webcam_capture.py
```

## 📡 Arquitectura

```
Frontend (3000)  →  Backend Node.js (3001)  →  Plant Vision (5000)
     │                      │                        │
     │                      │                        ├─ Mock IA Server
     │                      │                        └─ Webcam Capture
     │                      │
     └── Solicita detección ──→ Llama /classify ────→ Devuelve planta
```

## 🎯 Endpoints del Servicio Python

### `POST /classify`
Clasificar planta de imagen enviada.

**Request:**
```json
{
  "image": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "inference_id": "uuid",
  "time": 0.12,
  "image": {"width": 640, "height": 480},
  "predictions": [{
    "class": "romero",
    "class_id": 1,
    "confidence": 0.9796
  }],
  "top": "romero",
  "confidence": 0.9796
}
```

### `GET /health`
Estado del servicio.

### `POST /toggle-plant`
Cambiar manualmente la planta para testing.

## 📹 Captura de Webcam

El script `webcam_capture.py` ofrece:

- **Captura automática** cada 10 segundos
- **Clasificación en tiempo real** con overlay
- **Clasificación manual** presionando 'C'
- **Salir** presionando 'Q'

### Cámaras soportadas:
- **Cámara 0**: Cámara por defecto (built-in webcam)
- **Cámara 1**: Cámara externa (GoPro via USB)

## 🔄 Integración con el MVP

### Frontend:
1. **Panel de detección** con estado de conexión
2. **Botón "Detectar Planta"** para clasificación manual
3. **Auto-actualización** del tipo de planta seleccionada
4. **Recálculo automático** del riego tras detección

### Backend:
- **`POST /api/classify-plant`**: Proxy al servicio Python
- **`GET /api/plant-status`**: Verificar conexión con Plant Vision

## 🛠️ Configuración

### Cambiar cámara:
```python
# En webcam_capture.py
vision = PlantVisionCapture(
    camera_index=1,  # 0=built-in, 1=USB externa
    ai_service_url="http://localhost:5000/classify"
)
```

### Mockear diferentes plantas:
```python
# En mock_ai_server.py línea ~30
plant_type = 'menta'  # Cambiar por 'romero' o 'menta'
```

## 🎯 Flujo de Trabajo Completo

1. **Usuario abre dashboard** → Ve estado "Cámara desconectada"
2. **Ejecutar servicio Python** → Estado cambia a "Cámara conectada"
3. **Clic "Detectar Planta"** → Captura foto y clasifica
4. **IA devuelve resultado** → Frontend cambia planta automáticamente
5. **Recálculo automático** → Nuevos ml de agua según la planta detectada

## 🔮 Futuras Mejoras

### Paso 1: IA Real
- Reemplazar mock por Roboflow real
- Entrenar modelo con más plantas
- Añadir validación de confianza

### Paso 2: Captura Integrada
- WebRTC desde navegador
- Captura directa sin script Python
- Stream de video en tiempo real

### Paso 3: Plantas Múltiples
- Detección de múltiples plantas
- Área de cultivo vs maceta individual
- Mapeo de coordenadas de plantas

## 🐛 Troubleshooting

### "Cámara no se abre":
```bash
# Listar cámaras disponibles
ls /dev/video*

# Probar diferentes índices
python -c "import cv2; print([cv2.VideoCapture(i).isOpened() for i in range(4)])"
```

### "Servicio desconectado":
```bash
# Verificar que el servicio Python esté corriendo
curl http://localhost:5000/health

# Ver logs del servicio
python mock_ai_server.py
```

### "Error de CORS":
- El servicio Flask incluye CORS habilitado
- Verificar que los puertos sean correctos (5000, 3001, 3000)

---

🤖 **¡Tu sistema ya puede "ver" las plantas y regar automáticamente!** 🌱📹