# Regenerar archivos .g.dart
Write-Host "Regenerando archivos de serialización..." -ForegroundColor Yellow
flutter pub run build_runner build --delete-conflicting-outputs
Write-Host "Completado!" -ForegroundColor Green
