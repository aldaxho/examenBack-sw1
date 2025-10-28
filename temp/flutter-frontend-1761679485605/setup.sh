#!/bin/bash
echo "========================================"
echo "Configurando proyecto Flutter..."
echo "========================================"

echo ""
echo "1. Obteniendo dependencias..."
flutter pub get

echo ""
echo "2. Generando archivos de serialización JSON..."
flutter pub run build_runner build --delete-conflicting-outputs

echo ""
echo "========================================"
echo "Configuración completada!"
echo "========================================"
echo ""
echo "Para ejecutar la aplicación:"
echo "  flutter run -d chrome    # En navegador"
echo "  flutter run -d android   # En Android"
echo "  flutter devices          # Ver dispositivos"
