#!/bin/bash

# 🛑 MVP Riego Automatizado - Stop Script
# Para todos los servicios de forma segura

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🛑 Parando servicios del MVP Riego Automatizado...${NC}"

# Función para parar un servicio por PID
stop_service() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            echo -e "${BLUE}🔄 Parando $service_name (PID: $pid)...${NC}"
            kill $pid
            sleep 2

            # Si no se paró, forzar
            if kill -0 $pid 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Forzando parada de $service_name...${NC}"
                kill -9 $pid 2>/dev/null
            fi

            echo -e "${GREEN}✅ $service_name parado${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name ya estaba parado${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}⚠️  No se encontró PID para $service_name${NC}"
    fi
}

# Función para parar procesos por puerto (fallback)
stop_by_port() {
    local port=$1
    local service_name=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${BLUE}🔄 Parando proceso en puerto $port ($service_name)...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1

        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}❌ No se pudo parar proceso en puerto $port${NC}"
        else
            echo -e "${GREEN}✅ Puerto $port liberado${NC}"
        fi
    fi
}

# Parar servicios por PID
stop_service "plant-vision"
stop_service "backend"
stop_service "frontend"

# Fallback: parar por puerto si quedó algo
echo -e "${BLUE}🔍 Verificando puertos...${NC}"
stop_by_port 5001 "Plant Vision"
stop_by_port 3001 "Backend"
stop_by_port 3000 "Frontend"

# Limpiar logs viejos (opcional)
if [ "$1" = "--clean" ]; then
    echo -e "${BLUE}🧹 Limpiando logs...${NC}"
    rm -rf logs/
    echo -e "${GREEN}✅ Logs limpiados${NC}"
fi

echo -e "${GREEN}✅ Todos los servicios parados${NC}"