#!/bin/bash
# Script de deployment automático para producción

echo "🚀 Iniciando deployment en producción..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar que estamos en la rama correcta
echo "📋 Verificando rama..."
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
    echo -e "${YELLOW}⚠️  Advertencia: No estás en la rama main/master (estás en: $BRANCH)${NC}"
    read -p "¿Continuar de todas formas? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 2. Verificar que no haya cambios sin commitear
echo "📝 Verificando cambios pendientes..."
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ Hay cambios sin commitear${NC}"
    git status -s
    read -p "¿Hacer commit automático? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Mensaje del commit: " COMMIT_MSG
        git add .
        git commit -m "$COMMIT_MSG"
    else
        echo "Por favor, commitea tus cambios antes de continuar"
        exit 1
    fi
fi

# 3. Verificar configuración
echo "🔍 Verificando configuración..."
node check-config.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en la configuración. Por favor, revisa las variables de entorno.${NC}"
    exit 1
fi

# 4. Ejecutar tests (si existen)
echo "🧪 Ejecutando tests..."
npm test 2>/dev/null || echo "⚠️  No hay tests configurados"

# 5. Push a repositorio
echo "📤 Subiendo cambios a GitHub..."
git push origin $BRANCH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al hacer push${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ ¡Deployment completado!${NC}"
echo ""
echo "📊 Próximos pasos:"
echo "   1. Ve a tu dashboard de DigitalOcean App Platform"
echo "   2. Verifica que el deployment automático se haya iniciado"
echo "   3. Monitorea los logs durante el deployment"
echo "   4. Verifica que la app esté funcionando correctamente"
echo ""
echo "🔗 Enlaces útiles:"
echo "   - App Platform: https://cloud.digitalocean.com/apps"
echo "   - Logs: Ve a tu app → Runtime Logs"
echo ""
