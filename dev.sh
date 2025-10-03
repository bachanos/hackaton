#!/bin/bash

# 📝 MVP Riego Automatizado - Dev Script
# Inicia servicios y muestra logs en tiempo real con colores

# Colores para cada servicio
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Función para mostrar logs con colores
tail_with_colors() {
    tail -f logs/*.log | while read line; do
        case "$line" in
            *plant-vision*)
                echo -e "${PURPLE}[PLANT-VISION]${NC} $line"
                ;;
            *backend*)
                echo -e "${BLUE}[BACKEND]${NC} $line"
                ;;
            *frontend*)
                echo -e "${CYAN}[FRONTEND]${NC} $line"
                ;;
            *ERROR*)
                echo -e "${RED}$line${NC}"
                ;;
            *WARNING*)
                echo -e "${YELLOW}$line${NC}"
                ;;
            *SUCCESS*|*✅*)
                echo -e "${GREEN}$line${NC}"
                ;;
            *)
                echo "$line"
                ;;
        esac
    done
}

echo -e "${GREEN}🚀 Iniciando servicios en modo desarrollo...${NC}"

# Iniciar servicios
./start.sh &
start_pid=$!

# Esperar a que se creen los logs
sleep 5

echo -e "${YELLOW}📝 Mostrando logs en tiempo real (Ctrl+C para salir):${NC}"
echo -e "${PURPLE}[PLANT-VISION]${NC} - Servicio IA en puerto 5000"
echo -e "${BLUE}[BACKEND]${NC} - API Node.js en puerto 3001"
echo -e "${CYAN}[FRONTEND]${NC} - React dashboard en puerto 3000"
echo "================================================================"

# Trap para limpiar al salir
trap "kill $start_pid 2>/dev/null; ./stop.sh" INT TERM

# Mostrar logs con colores
tail_with_colors