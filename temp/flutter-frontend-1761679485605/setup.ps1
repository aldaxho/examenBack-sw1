# Script de configuración para proyecto Flutter
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configurando proyecto Flutter..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Obteniendo dependencias..." -ForegroundColor Yellow
flutter pub get

Write-Host ""
Write-Host "2. Generando archivos de serialización JSON..." -ForegroundColor Yellow
flutter pub run build_runner build --delete-conflicting-outputs

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Configuración completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para ejecutar la aplicación:" -ForegroundColor Cyan
Write-Host "  flutter run -d chrome    # En navegador" -ForegroundColor White
Write-Host "  flutter run -d android   # En Android" -ForegroundColor White
Write-Host "  flutter devices          # Ver dispositivos" -ForegroundColor White
