@echo off
REM Script para ejecutar el backend Spring Boot generado
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Error: Java no esta instalado
  echo Descarga Java desde https://www.java.com
  pause
  exit /b 1
)
set JAR_PATH=
for %%f in ("%~dp0target\*.jar") do set JAR_PATH=%%~ff
if "%JAR_PATH%"=="" (
  echo JAR no encontrado. Intentando compilar con mvnw.cmd...
  call "%~dp0mvnw.cmd" clean package -DskipTests -q
  for %%f in ("%~dp0target\*.jar") do set JAR_PATH=%%~ff
  if "%JAR_PATH%"=="" (
    echo Error: No se pudo compilar el proyecto. Ejecuta: mvnw.cmd clean package
    pause
    exit /b 1
  )
)
echo Iniciando aplicacion...
echo JAR: %JAR_PATH%
java -jar "%JAR_PATH%"
pause