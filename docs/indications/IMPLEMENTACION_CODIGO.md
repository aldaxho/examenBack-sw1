````markdown
# Código Listo para Implementar en el Generador

Este documento contiene el código exacto para modificar `simpleSpringBootGenerator.js`.

## 📍 PASO 1: Localizar dónde editar

En `simpleSpringBootGenerator.js`, busca la función `generateSimpleSpringBootProject`:

```javascript
// Alrededor de línea 80
async function generateSimpleSpringBootProject(diagramaJSON, titulo) {
  console.log('Generando proyecto Spring Boot completo...');

  // ... código de creación de directorios ...

  // Busca esta sección:
  await createMainApplicationClass(srcDir);
  await createConfigurationClasses(configDir);
  await createPomXml(projectDir, entities);
  await createApplicationProperties(resourcesDir);
  await createMavenWrapper(projectDir);  // ← ESTA LÍNEA
  await createReadme(projectDir, cleanTitulo, entities);
}
```

---

## 📍 PASO 2: Reemplazar la función `createMavenWrapper`

**Búsca:** La función `createMavenWrapper` (línea ~1020)

**Reemplaza TODO el contenido** con esto:

```javascript
// ==========================================
// NUEVA FUNCIÓN: Crear Maven Wrapper con JAR pre-descargado
// ==========================================
async function createMavenWrapper(projectDir) {
  const wrapperDir = path.join(projectDir, '.mvn', 'wrapper');
  await fs.mkdir(wrapperDir, { recursive: true });

  // Maven Wrapper Properties
  const wrapperProperties = `# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

# Maven Wrapper Configuration
distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip
wrapperUrl=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar`;

  await fs.writeFile(path.join(wrapperDir, 'maven-wrapper.properties'), wrapperProperties);

  // 🆕 DESCARGAR MAVEN WRAPPER JAR (una sola vez en generación)
  const wrapperJarUrl = 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar';
  const wrapperJarPath = path.join(wrapperDir, 'maven-wrapper.jar');

  try {
    console.log('📥 Descargando Maven Wrapper JAR...');

    let buffer;

    // Intentar con fetch (Node 18+)
    if (typeof fetch === 'function') {
      try {
        const response = await fetch(wrapperJarUrl, { timeout: 30000 });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } catch (fetchError) {
        console.warn('⚠️ Fetch falló, intentando con HTTPS...');
        throw fetchError; // Forzar caída a HTTPS
      }
    }

    // Fallback: HTTPS (para Node < 18)
    if (!buffer) {
      buffer = await new Promise((resolve, reject) => {
        const https = require('https');
        https.get(wrapperJarUrl, (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject).setTimeout(30000);
      });
    }

    // Validar que se descargó correctamente
    const MIN_SIZE = 1500000; // 1.5 MB
    if (buffer.length < MIN_SIZE) {
      throw new Error(`JAR demasiado pequeño: ${buffer.length} bytes (esperaba >= ${MIN_SIZE})`);
    }

    // Escribir archivo
    await fs.writeFile(wrapperJarPath, buffer);

    // Verificar integridad
    const stats = await fs.stat(wrapperJarPath);
    if (stats.size !== buffer.length) {
      throw new Error(`Error de integridad: ${stats.size} != ${buffer.length}`);
    }

    console.log(`✅ Maven Wrapper descargado: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   El usuario NO necesitará Maven instalado ✓`);

  } catch (error) {
    console.error('❌ Error descargando Maven Wrapper:', error.message);
    console.log('   Creando instrucciones de reparación automática...');

    // Crear archivo de reparación si falla la descarga
    const repairScript = `# Maven Wrapper JAR - Reparación Automática

## El JAR de Maven Wrapper no se incluyó. Ejecuta esto:

### Windows PowerShell:
```powershell
$jarPath = ".mvn\\wrapper\\maven-wrapper.jar"
$url = "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

Write-Host "Descargando Maven Wrapper..." -ForegroundColor Cyan
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
New-Item -ItemType Directory -Path ".mvn\\wrapper" -Force | Out-Null
Invoke-WebRequest -Uri $url -OutFile $jarPath -UseBasicParsing

if ((Get-Item $jarPath).Length -gt 1500000) {
    Write-Host "✅ Completado. Ahora ejecuta: mvnw.cmd spring-boot:run" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Archivo demasiado pequeño" -ForegroundColor Red
}
```

### Linux/Mac:
```bash
#!/bin/bash
jarPath=".mvn/wrapper/maven-wrapper.jar"
url="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

echo "Descargando Maven Wrapper..."
mkdir -p ".mvn/wrapper"
curl -L "$url" -o "$jarPath"

if [ -f "$jarPath" ] && [ $(stat -f%z "$jarPath" 2>/dev/null || stat -c%s "$jarPath") -gt 1500000 ]; then
    echo "✅ Completado. Ahora ejecuta: ./mvnw spring-boot:run"
else
    echo "❌ Error: Archivo demasiado pequeño"
fi
```
`;

    await fs.writeFile(path.join(projectDir, 'FIX_MAVEN_WRAPPER.md'), repairScript);
  }

  // Crear scripts mvnw.cmd y mvnw (código existente)
  // ... mantener el código original de los scripts ...
}
```

---

## 📍 PASO 3: Agregar funciones nuevas

Agrega estas funciones DESPUÉS de `createMavenWrapper`:

```javascript
// ==========================================
// NUEVA: Compilar JAR ejecutable
// ==========================================
async function generateJarExecutable(projectDir) {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    console.log('⏳ Compilando JAR ejecutable (esto toma 1-2 minutos)...');

    const command = process.platform === 'win32'
      ? `mvnw.cmd clean package -DskipTests -q`
      : `./mvnw clean package -DskipTests -q`;

    const { stdout, stderr } = await execPromise(command, {
      cwd: projectDir,
      timeout: 300000, // 5 minutos
      maxBuffer: 1024 * 1024 * 10
    });

    const jarPath = path.join(projectDir, 'target', 'demo-0.0.1-SNAPSHOT.jar');
    const stats = await fs.stat(jarPath);

    console.log(`✅ JAR generado: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Ubicación: target/demo-0.0.1-SNAPSHOT.jar`);
    console.log(`   Usuario puede ejecutar: java -jar target/demo-0.0.1-SNAPSHOT.jar`);

    return jarPath;

  } catch (error) {
    console.warn('⚠️ No se pudo generar JAR automáticamente (normal si no hay Maven)');
    console.log(`   Usuario puede compilar después con: mvnw clean package`);
    console.log(`   Error: ${error.message.split('\n')[0]}`);
    return null;
  }
}

// ==========================================
// NUEVA: Crear scripts universales
// ==========================================
async function createUniversalStartScripts(projectDir) {
  // Script para Windows
  const startBat = `@echo off
REM ================================================
REM Script para ejecutar el backend Spring Boot
REM ================================================

echo.
echo ╔════════════════════════════════════════╗
echo ║  🚀 Iniciando aplicación Spring Boot   ║
echo ╚════════════════════════════════════════╝
echo.

REM Verificar que Java está instalado
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Java no está instalado
    echo.
    echo Solución: Descarga Java desde https://www.java.com
    pause
    exit /b 1
)

REM Obtener ruta absoluta del proyecto
set PROJECT_DIR=%~dp0
set JAR_PATH=%PROJECT_DIR%target\\demo-0.0.1-SNAPSHOT.jar

REM Si no existe el JAR, compilar
if not exist "%JAR_PATH%" (
    echo ⏳ JAR no encontrado. Compilando...
    call "%PROJECT_DIR%mvnw.cmd" clean package -DskipTests -q

    if not exist "%JAR_PATH%" (
        echo ❌ Error: No se pudo compilar
        echo.
        echo Soluciones:
        echo 1. Asegúrate de tener Java 17+ instalado
        echo 2. Ejecuta: mvnw.cmd clean package
        echo.
        pause
        exit /b 1
    )
)

echo ✅ Iniciando aplicación...
echo.
echo 📍 URL: http://localhost:8080
echo 📚 Documentación: http://localhost:8080/swagger-ui.html
echo 🗄️  Base de datos: http://localhost:8080/h2-console
echo.
echo Presiona CTRL+C para detener
echo.

java -jar "%JAR_PATH%"
pause
`;

  // Script para Linux/Mac
  const startSh = `#!/bin/bash

# ================================================
# Script para ejecutar el backend Spring Boot
# ================================================

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  🚀 Iniciando aplicación Spring Boot   ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Obtener ruta del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Verificar que Java está instalado
if ! command -v java &> /dev/null; then
    echo "❌ Error: Java no está instalado"
    echo ""
    echo "Solución: Descarga Java desde https://www.java.com"
    exit 1
fi

# Ruta del JAR
JAR_PATH="$SCRIPT_DIR/target/demo-0.0.1-SNAPSHOT.jar"

# Si no existe el JAR, compilar
if [ ! -f "$JAR_PATH" ]; then
    echo "⏳ JAR no encontrado. Compilando..."
    "$SCRIPT_DIR/mvnw" clean package -DskipTests -q

    if [ ! -f "$JAR_PATH" ]; then
        echo "❌ Error: No se pudo compilar"
        echo ""
        echo "Soluciones:"
        echo "1. Asegúrate de tener Java 17+ instalado"
        echo "2. Ejecuta: ./mvnw clean package"
        echo ""
        exit 1
    fi
fi

echo "✅ Iniciando aplicación..."
echo ""
echo "📍 URL: http://localhost:8080"
echo "📚 Documentación: http://localhost:8080/swagger-ui.html"
echo "🗄️  Base de datos: http://localhost:8080/h2-console"
echo ""
echo "Presiona CTRL+C para detener"
echo ""

java -jar "$JAR_PATH"
`;

  const fs = require('fs').promises;

  try {
    // Escribir archivo Windows
    await fs.writeFile(path.join(projectDir, 'start.bat'), startBat);

    // Escribir archivo Linux/Mac
    await fs.writeFile(path.join(projectDir, 'start.sh'), startSh);

    // Hacer ejecutable en Linux/Mac
    try {
      const { exec } = require('child_process');
      exec(`chmod +x "${path.join(projectDir, 'start.sh')}"`, () => {});
    } catch (e) {
      // Ignorar si está en Windows
    }

    console.log('✅ Scripts de inicio creados:');
    console.log(`   Windows: double-click "start.bat"`);
    console.log(`   Linux/Mac: ./start.sh`);

  } catch (error) {
    console.warn('⚠️ No se pudieron crear scripts de inicio:', error.message);
  }
}
```

---

## 📍 PASO 4: Modificar la función principal

Encuentra esta línea en `generateSimpleSpringBootProject`:

```javascript
await createMavenWrapper(projectDir);
await createReadme(projectDir, cleanTitulo, entities);
```

**Reemplaza por:**

```javascript
await createMavenWrapper(projectDir);
await createUniversalStartScripts(projectDir);
// await generateJarExecutable(projectDir); // Descomenta si tienes Maven en el servidor
await createReadme(projectDir, cleanTitulo, entities);
```

---

## 📍 PASO 5: Actualizar README.md generado

En la función `createReadme`, agrega esta sección al principio:

```javascript
// Dentro de createReadme, después del título:

let readmeContent = `# ${cleanTitulo || 'Proyecto Spring Boot Generado'}

## ⚡ Inicio Rápido

### Opción 1: Double-Click (Windows)
1. Abre el explorador de archivos
2. Haz doble-click en **start.bat**
3. La aplicación se iniciará automáticamente

### Opción 2: Terminal (Linux/Mac)
```bash
./start.sh
```

### Opción 3: Línea de comando (Todos)
```bash
# Compilar (primera vez)
${process.platform === 'win32' ? 'mvnw.cmd' : './mvnw'} clean package

# Ejecutar
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

**Accede a:** http://localhost:8080

---

## 🧪 PRUEBAS

Después de implementar, prueba con:

```bash
# En tu directorio generador
cd temp/spring-backend-*

# Windows
start.bat

# Linux/Mac
./start.sh

# Debería ver:
# ✅ Iniciando aplicación...
# 📍 URL: http://localhost:8080
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Localicé la función `createMavenWrapper` en línea ~1020
- [ ] Reemplacé el contenido con la nueva función
- [ ] Agregué la función `generateJarExecutable`
- [ ] Agregué la función `createUniversalStartScripts`
- [ ] Modificué `generateSimpleSpringBootProject` para llamar a `createUniversalStartScripts`
- [ ] Actualicé el README en `createReadme`
- [ ] Probé generando un proyecto y ejecutando `start.bat` o `start.sh`
- [ ] Verifico que el JAR se crea en `target/demo-0.0.1-SNAPSHOT.jar`

---

## 🎯 RESULTADO FINAL

**Usuario descarga ZIP y:**

1. **Windows:** Double-click `start.bat` → ¡Listo!
2. **Mac/Linux:** `./start.sh` → ¡Listo!
3. **Cualquiera:** `java -jar target/demo-0.0.1-SNAPSHOT.jar` → ¡Listo!

**Sin necesidad de:**
- Maven
- Gradle
- Compilación manual
- Configuración

¡El usuario final tiene una experiencia like Netflix, no como programador! 🚀

````markdown
