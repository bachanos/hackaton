#!/bin/bash

# 🔄 MVP Riego Automatizado - Reset Script
# Para y reinicia todos los servicios en un solo comando

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Reiniciando sistema completo...${NC}"

# Parar servicios
echo -e "${BLUE}📴 Parando servicios...${NC}"
./stop.sh

# Pequeña pausa para asegurar que todo se paró
sleep 2

# Iniciar servicios
echo -e "${BLUE}🚀 Iniciando servicios...${NC}"
source plant-vision-env/bin/activate && ./start.sh

echo -e "${GREEN}✅ Reset completado${NC}"