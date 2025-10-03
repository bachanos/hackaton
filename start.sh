#!/bin/bash

# 🚀 MVP Riego Automatizado - Launcher Script
# Levanta todos los servicios con manejo inteligente de puertos

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Puertos que vamos a usar
PLANT_VISION_PORT=5001
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Banner
echo -e "${BLUE}"
echo "🌱 MVP RIEGO AUTOMATIZADO CON NASA APIs + PLANT VISION 🤖"
echo "================================================================"
echo -e "${NC}"

# Función para verificar si un puerto está ocupado
check_port() {
    local port=$1
    local service_name=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Puerto $port ocupado ($service_name)${NC}"

        # Preguntar si matar el proceso
        read -p "¿Matar proceso en puerto $port? (y/N): " kill_process
        if [[ $kill_process =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}🔄 Matando proceso en puerto $port...${NC}"
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 1

            # Verificar que se mató
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                echo -e "${RED}❌ No se pudo liberar puerto $port${NC}"
                return 1
            else
                echo -e "${GREEN}✅ Puerto $port liberado${NC}"
            fi
        else
            echo -e "${RED}❌ Abortando - puerto $port ocupado${NC}"
            return 1
        fi
    else
        echo -e "${GREEN}✅ Puerto $port disponible ($service_name)${NC}"
    fi
    return 0
}

# Función para verificar dependencias
check_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependencias...${NC}"

    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ python3 no encontrado${NC}"
        echo "Instala Python 3.8+ con: brew install python@3.11"
        exit 1
    fi

    python_version=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    echo -e "${GREEN}✅ Python $python_version encontrado${NC}"

    # Verificar Node.js
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm no encontrado${NC}"
        echo "Instala Node.js desde: https://nodejs.org/"
        exit 1
    fi

    node_version=$(node --version)
    echo -e "${GREEN}✅ Node.js $node_version encontrado${NC}"

    # Verificar dependencias Python
    if [ ! -d "plant-vision" ]; then
        echo -e "${RED}❌ Directorio plant-vision no encontrado${NC}"
        exit 1
    fi

    echo -e "${BLUE}🔍 Verificando dependencias Python...${NC}"
    python3 -c "import flask, flask_cors, cv2, requests" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Dependencias Python faltantes, instalando...${NC}"
        pip3 install -r plant-vision/requirements.txt
    }
    echo -e "${GREEN}✅ Dependencias Python OK${NC}"

    # Verificar dependencias Node.js
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Dependencias Node.js faltantes, instalando...${NC}"
        npm run install:all
    fi
    echo -e "${GREEN}✅ Dependencias Node.js OK${NC}"
}

# Función para iniciar un servicio en background
start_service() {
    local service_name=$1
    local command=$2
    local port=$3
    local log_file="logs/${service_name}.log"

    echo -e "${BLUE}🚀 Iniciando $service_name (puerto $port)...${NC}"

    # Crear directorio de logs si no existe
    mkdir -p logs

    # Ejecutar comando en background y guardar PID
    nohup $command > "$log_file" 2>&1 &
    local pid=$!
    echo $pid > "logs/${service_name}.pid"

    # Verificar que inició correctamente
    sleep 2
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✅ $service_name iniciado (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}❌ Error iniciando $service_name${NC}"
        cat "$log_file"
        return 1
    fi
}

# Función para verificar que los servicios respondieron
wait_for_services() {
    echo -e "${BLUE}⏳ Esperando que los servicios estén listos...${NC}"

    # Esperar Plant Vision
    echo -n "🤖 Plant Vision (5000): "
    for i in {1..30}; do
        if curl -s http://localhost:5000/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done

    # Esperar Backend
    echo -n "🚀 Backend (3001): "
    for i in {1..30}; do
        if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done

    # Esperar Frontend
    echo -n "🎨 Frontend (3000): "
    for i in {1..30}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo -e "${GREEN}✅${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
}

# Función para mostrar URLs y comandos útiles
show_info() {
    echo -e "${GREEN}"
    echo "🎉 ¡Todos los servicios iniciados correctamente!"
    echo "=============================================="
    echo -e "${NC}"
    echo -e "${BLUE}📱 URLs disponibles:${NC}"
    echo "   🎨 Frontend (Dashboard): http://localhost:3000"
    echo "   🚀 Backend (API):        http://localhost:3001"
    echo "   🤖 Plant Vision (IA):    http://localhost:5000"
    echo ""
    echo -e "${BLUE}📋 Comandos útiles:${NC}"
    echo "   ./stop.sh                 - Parar todos los servicios"
    echo "   tail -f logs/*.log        - Ver logs en tiempo real"
    echo "   ./restart.sh              - Reiniciar servicios"
    echo ""
    echo -e "${BLUE}📁 Logs guardados en:${NC}"
    echo "   logs/plant-vision.log"
    echo "   logs/backend.log"
    echo "   logs/frontend.log"
    echo ""
    echo -e "${PURPLE}🎯 Para la webcam ejecuta en terminal separado:${NC}"
    echo "   python3 plant-vision/webcam_capture.py"
    echo ""
}

# Función principal
main() {
    echo -e "${BLUE}🔧 Iniciando proceso de setup...${NC}"

    # Verificar dependencias
    check_dependencies

    # Verificar puertos
    check_port $PLANT_VISION_PORT "Plant Vision" || exit 1
    check_port $BACKEND_PORT "Backend" || exit 1
    check_port $FRONTEND_PORT "Frontend" || exit 1

    echo -e "${BLUE}🚀 Iniciando servicios...${NC}"

    # Iniciar Plant Vision
    start_service "plant-vision" "python3 plant-vision/mock_ai_server.py" $PLANT_VISION_PORT

    # Iniciar Backend
    start_service "backend" "npm run dev:backend" $BACKEND_PORT

    # Iniciar Frontend
    start_service "frontend" "npm run dev:frontend" $FRONTEND_PORT

    # Esperar que respondan
    wait_for_services

    # Mostrar información
    show_info

    # Mantener script corriendo para mostrar logs
    echo -e "${YELLOW}📝 Presiona Ctrl+C para parar todos los servicios${NC}"
    echo ""

    # Mostrar logs en tiempo real
    tail -f logs/*.log 2>/dev/null &
    tail_pid=$!

    # Trap para limpiar al salir
    trap "kill $tail_pid 2>/dev/null; ./stop.sh" INT TERM

    # Esperar indefinidamente
    wait
}

# Ejecutar función principal
main "$@"