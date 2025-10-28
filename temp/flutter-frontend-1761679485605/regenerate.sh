#!/bin/bash
echo "Regenerando archivos de serialización..."
flutter pub run build_runner build --delete-conflicting-outputs
echo "Completado!"
