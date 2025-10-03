#!/bin/bash

# 🔄 MVP Riego Automatizado - Restart Script
# Para y reinicia todos los servicios

# Colores
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}🔄 Reiniciando servicios del MVP...${NC}"

# Parar servicios actuales
./stop.sh

# Esperar un poco
sleep 2

# Iniciar servicios
echo -e "${BLUE}🚀 Reiniciando...${NC}"
./start.sh