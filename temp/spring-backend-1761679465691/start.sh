#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if ! command -v java &> /dev/null; then
  echo "Error: Java no esta instalado"
  echo "Descarga Java desde https://www.java.com"
  exit 1
fi

JAR_PATH=$(ls "$SCRIPT_DIR/target"/*.jar 2>/dev/null | head -n 1)
if [ -z "$JAR_PATH" ]; then
  echo "JAR no encontrado. Intentando compilar con ./mvnw..."
  "$SCRIPT_DIR/mvnw" clean package -DskipTests -q || true
  JAR_PATH=$(ls "$SCRIPT_DIR/target"/*.jar 2>/dev/null | head -n 1)
  if [ -z "$JAR_PATH" ]; then
    echo "Error: No se pudo compilar el proyecto. Ejecuta: ./mvnw clean package"
    exit 1
  fi
fi

echo "Iniciando aplicacion..."
echo "JAR: $JAR_PATH"
java -jar "$JAR_PATH"