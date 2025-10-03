# 📝 Notas de Mi Configuración - macOS

Este archivo contiene detalles específicos de mi setup de desarrollo para el MVP de riego automatizado con Plant Vision.

## 🍎 Mi Máquina
- **Sistema**: macOS (MacBook)
- **Fecha setup**: 3 Octubre 2025
- **Directorio**: `/Users/agualis/experimental/nasa`

## 🐍 Python Setup
```bash
# Mi versión actual
python3 --version  # Debería ser ≥3.8

# Si necesité instalar nueva versión
brew install python@3.11

# Dependencias instaladas
pip3 install -r plant-vision/requirements.txt
```

## 📹 Configuración de Cámaras
- **Cámara built-in**: índice 0 (webcam MacBook)
- **GoPro USB**: índice 1 (cuando esté conectada)
- **Resolución usada**: 640x480 por defecto

### Probar cámaras disponibles:
```bash
# Ver qué cámaras responden
python3 -c "import cv2; print([cv2.VideoCapture(i).isOpened() for i in range(4)])"
# Output esperado: [True, False, False, False] = solo built-in
# Con GoPro: [True, True, False, False] = built-in + GoPro
```

## 🚀 Mi Flujo de Trabajo Habitual

### Desarrollo completo (4 terminales):
```bash
# Terminal 1: IA Mock
python3 plant-vision/mock_ai_server.py

# Terminal 2: Backend
npm run dev:backend

# Terminal 3: Frontend
npm run dev:frontend

# Terminal 4: Webcam (opcional)
python3 plant-vision/webcam_capture.py
```

### Demo rápida (2 terminales):
```bash
# Terminal 1: Solo IA
python3 plant-vision/mock_ai_server.py

# Terminal 2: Web completa
npm run dev
```

## 🔧 Comandos Útiles Mac

### Verificar puertos en uso:
```bash
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5000  # Plant Vision
```

### Matar procesos si se cuelgan:
```bash
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5000 | xargs kill -9  # Plant Vision
```

### Ver logs de servicios:
```bash
# Los logs aparecen directamente en cada terminal
# Python: print() statements
# Node.js: console.log() statements
```

## 📂 Estructura que Creé
```
mvp-riego-automatizado/
├── plant-vision/           # ✅ Servicios Python IA
│   ├── mock_ai_server.py   # ✅ Flask servidor (puerto 5000)
│   ├── webcam_capture.py   # ✅ Captura + clasificación
│   ├── requirements.txt    # ✅ Deps Python
│   └── README.md          # ✅ Docs específicas
├── backend/               # ✅ API Node.js (puerto 3001)
├── frontend/              # ✅ React dashboard (puerto 3000)
└── SETUP_NOTES.md         # ✅ Este archivo
```

## 🌱 Características Implementadas

### Backend Node.js:
- ✅ Cálculo de riego con evapotranspiración
- ✅ Plantas: Menta (Kc=1.2) y Romero (Kc=0.6)
- ✅ Ubicación: EINA Zaragoza (41.6836, -0.8881)
- ✅ Macetas: 10cm diámetro
- ✅ APIs NASA: APOD imagen del día
- ✅ Integración con Plant Vision

### Frontend React:
- ✅ Dashboard responsive con tema NASA
- ✅ Selector de plantas visual
- ✅ Panel de detección automática IA
- ✅ Gráficos de temperatura 24h
- ✅ Cálculo en tiempo real de ml de agua

### Plant Vision Python:
- ✅ Servidor Flask mock IA (puerto 5000)
- ✅ Captura webcam con OpenCV
- ✅ Clasificación automática cada 10s
- ✅ Integración completa con frontend
- ✅ Support para múltiples cámaras

## 🎯 URLs de Mi Setup
- **Dashboard**: http://localhost:3000
- **API Backend**: http://localhost:3001
- **Plant Vision**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔮 Próximos Pasos Recordatorios
1. **IA Real**: Reemplazar mock por Roboflow
2. **GoPro**: Probar con cámara externa USB
3. **Más plantas**: Añadir albahaca, perejil, etc.
4. **Sensores**: Integrar humedad de suelo real
5. **Deploy**: Subir a servidor para demo externa

---
💡 **Nota**: Este archivo es mi referencia personal para recordar el setup cuando vuelva al proyecto.