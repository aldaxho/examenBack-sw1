const { generateFlutterProject } = require('../utils/flutterGenerator');
const { Diagrama } = require('../models');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const archiver = require('archiver');

// Endpoint para generar Flutter con conexión automática al backend Spring Boot
async function generateFlutterWithBackend(req, res) {
  const { id } = req.params;
  const { backendPort = 8080 } = req.body; // Puerto del backend Spring Boot
  
  try {
    console.log(`🚀 Generando Flutter frontend con conexión al backend para diagrama ID: ${id}`);
    
    // Obtener diagrama
    const diagrama = await Diagrama.findByPk(id);
    if (!diagrama) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }

    console.log(`📱 Diagrama encontrado: ${diagrama.titulo}`);
    
    // Parsear contenido del diagrama
    let diagramaJSON;
    try {
      if (typeof diagrama.contenido === 'string') {
        const cleanContent = diagrama.contenido.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        diagramaJSON = JSON.parse(cleanContent);
      } else {
        diagramaJSON = diagrama.contenido;
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(400).json({ error: 'Contenido del diagrama no es JSON válido' });
    }

    // Generar proyecto Flutter con conexión al backend
    console.log('🔧 Generando proyecto Flutter con conexión automática...');
    const result = await generateFlutterProject(diagramaJSON, diagrama.titulo, backendPort);
    
    if (!result.success) {
      return res.status(500).json({ 
        error: 'Error generando proyecto Flutter',
        details: result.error 
      });
    }

    console.log(`📱 Proyecto Flutter generado: ${result.projectName}`);
    console.log(`📍 Ubicación: ${result.projectPath}`);
    console.log(`🔗 Conectado al backend en puerto: ${backendPort}`);

    // Crear ZIP del proyecto
    console.log('📦 Creando archivo ZIP...');
    const zipPath = path.join(result.projectPath, `${result.projectName}.zip`);
    
    await createZipFile(result.projectPath, zipPath);
    
    // Verificar que el ZIP se creó correctamente
    const zipStats = await fsPromises.stat(zipPath);
    console.log(`✅ ZIP creado: ${zipStats.size} bytes`);

    // Enviar el archivo ZIP como respuesta
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${result.projectName}.zip"`);
    
    const zipBuffer = await fsPromises.readFile(zipPath);
    res.send(zipBuffer);

    // Limpiar archivos temporales después de enviar
    setTimeout(async () => {
      try {
        await fsPromises.rm(result.projectPath, { recursive: true, force: true });
        console.log(`🗑️ Directorio temporal limpiado: ${result.projectPath}`);
      } catch (cleanupError) {
        console.error('Error limpiando archivos temporales:', cleanupError);
      }
    }, 5000);

  } catch (error) {
    console.error('Error al generar Flutter:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

// Endpoint para generar tanto backend como frontend en un solo ZIP
async function generateFullStackProject(req, res) {
  const { id } = req.params;
  const { backendPort = 8080 } = req.body;
  
  try {
    console.log(`🚀 Generando proyecto full-stack completo para diagrama ID: ${id}`);
    
    // Obtener diagrama
    const diagrama = await Diagrama.findByPk(id);
    if (!diagrama) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }

    console.log(`📊 Diagrama encontrado: ${diagrama.titulo}`);
    
    // Parsear contenido del diagrama
    let diagramaJSON;
    try {
      if (typeof diagrama.contenido === 'string') {
        const cleanContent = diagrama.contenido.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        diagramaJSON = JSON.parse(cleanContent);
      } else {
        diagramaJSON = diagrama.contenido;
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return res.status(400).json({ error: 'Contenido del diagrama no es JSON válido' });
    }

    // Generar backend Spring Boot
    console.log('🔧 Generando backend Spring Boot...');
    const { generateSimpleSpringBootProject } = require('../utils/simpleSpringBootGenerator');
    const backendResult = await generateSimpleSpringBootProject(diagramaJSON, diagrama.titulo);
    
    if (!backendResult.success) {
      return res.status(500).json({ 
        error: 'Error generando backend Spring Boot',
        details: backendResult.error 
      });
    }

    // Generar frontend Flutter
    console.log('📱 Generando frontend Flutter...');
    const { generateFlutterProject } = require('../utils/flutterGenerator');
    const frontendResult = await generateFlutterProject(diagramaJSON, diagrama.titulo, backendPort);
    
    if (!frontendResult.success) {
      return res.status(500).json({ 
        error: 'Error generando frontend Flutter',
        details: frontendResult.error 
      });
    }

    // Crear directorio para el proyecto completo
    const timestamp = Date.now();
    const fullProjectName = `fullstack-${diagrama.titulo.replace(/[^\w\s]/g, '').trim()}-${timestamp}`;
    const fullProjectDir = path.join(__dirname, '../temp', fullProjectName);
    await fsPromises.mkdir(fullProjectDir, { recursive: true });

    // Mover backend y frontend al directorio completo
    const backendDir = path.join(fullProjectDir, 'backend');
    const frontendDir = path.join(fullProjectDir, 'frontend');
    
    await fsPromises.rename(backendResult.projectPath, backendDir);
    await fsPromises.rename(frontendResult.projectPath, frontendDir);

    // Crear README principal del proyecto completo
    await createFullStackReadme(fullProjectDir, diagrama.titulo, backendResult.entities, backendPort);

    // Crear scripts de ejecución
    await createExecutionScripts(fullProjectDir, backendPort);

    console.log(`🎉 Proyecto full-stack generado: ${fullProjectName}`);
    console.log(`📍 Backend: ${backendDir}`);
    console.log(`📍 Frontend: ${frontendDir}`);

    // Crear ZIP del proyecto completo
    console.log('📦 Creando archivo ZIP del proyecto completo...');
    const zipPath = path.join(fullProjectDir, `${fullProjectName}.zip`);
    
    await createZipFile(fullProjectDir, zipPath);
    
    // Verificar que el ZIP se creó correctamente
    const zipStats = await fsPromises.stat(zipPath);
    console.log(`✅ ZIP completo creado: ${zipStats.size} bytes`);

    // Enviar el archivo ZIP como respuesta
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fullProjectName}.zip"`);
    
    const zipBuffer = await fsPromises.readFile(zipPath);
    res.send(zipBuffer);

    // Limpiar archivos temporales después de enviar
    setTimeout(async () => {
      try {
        await fsPromises.rm(fullProjectDir, { recursive: true, force: true });
        console.log(`🗑️ Directorio temporal limpiado: ${fullProjectDir}`);
      } catch (cleanupError) {
        console.error('Error limpiando archivos temporales:', cleanupError);
      }
    }, 10000);

  } catch (error) {
    console.error('Error al generar proyecto full-stack:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

// Función para crear archivo ZIP
async function createZipFile(sourceDir, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`📦 ZIP creado: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      console.error('Error creando ZIP:', err);
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

// Crear README principal del proyecto full-stack
async function createFullStackReadme(projectDir, titulo, entities, backendPort) {
  const readmeContent = `# ${titulo} - Sistema Full-Stack

## 🚀 Descripción

Sistema de gestión empresarial completo generado automáticamente desde diagrama UML:
- **Backend**: Spring Boot con API REST
- **Frontend**: Flutter para dispositivos móviles
- **Conexión**: Automática entre frontend y backend

## 📋 Prerrequisitos

### Backend (Spring Boot)
- Java 17 o superior
- El proyecto incluye Maven Wrapper

### Frontend (Flutter)
- Flutter SDK 3.0 o superior
- Dart SDK 3.0 o superior
- Android Studio / VS Code con extensiones Flutter

## 🛠️ Instalación y Ejecución

### 1. Ejecutar Backend (Spring Boot)

\`\`\`bash
cd backend

# Compilar y ejecutar
./mvnw clean compile
./mvnw spring-boot:run
\`\`\`

El backend estará disponible en: **http://localhost:${backendPort}**

### 2. Ejecutar Frontend (Flutter)

\`\`\`bash
cd frontend

# Obtener dependencias
flutter pub get

# Ejecutar en dispositivo/emulador
flutter run
\`\`\`

## 🔗 Conexión Automática

El frontend Flutter está configurado para conectarse automáticamente al backend Spring Boot en el puerto ${backendPort}.

### Configuración de Conexión

El archivo \`lib/config/api_config.dart\` contiene la configuración de conexión:

\`\`\`dart
class ApiConfig {
  static const String baseUrl = 'http://localhost:${backendPort}/api';
  // Para dispositivos físicos, usar la IP de tu computadora:
  // static const String baseUrl = 'http://192.168.1.100:${backendPort}/api';
}
\`\`\`

## 📱 Funcionalidades del Frontend

### Pantallas Generadas
${entities.map(entity => `- **${entity}**: Gestión completa de ${entity.toLowerCase()}`).join('\n')}

### Características
- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar registros
- ✅ **Navegación**: Entre pantallas de diferentes entidades
- ✅ **Formularios**: Validación y envío de datos
- ✅ **Listas**: Visualización paginada de datos
- ✅ **Búsqueda**: Filtrado y búsqueda de registros
- ✅ **Estados**: Manejo de estados de carga y error
- ✅ **Responsive**: Adaptado a diferentes tamaños de pantalla

## 🔧 Estructura del Proyecto

\`\`\`
${titulo.replace(/[^\w\s]/g, '').trim()}/
├── backend/                 # Spring Boot Backend
│   ├── src/main/java/      # Código Java
│   ├── src/main/resources/ # Configuración
│   └── pom.xml            # Dependencias Maven
├── frontend/               # Flutter Frontend
│   ├── lib/
│   │   ├── models/        # Modelos de datos
│   │   ├── services/      # Servicios API
│   │   ├── screens/       # Pantallas de la app
│   │   ├── widgets/       # Widgets reutilizables
│   │   └── config/        # Configuración
│   ├── android/           # Configuración Android
│   ├── ios/               # Configuración iOS
│   └── pubspec.yaml       # Dependencias Flutter
├── scripts/               # Scripts de ejecución
└── README.md              # Este archivo
\`\`\`

## 📊 Entidades del Sistema

${entities.map(entity => `
### ${entity}
- **Gestión completa** de ${entity.toLowerCase()}
- **API Endpoints**: /api/${entity.toLowerCase()}
- **Operaciones**: GET, POST, PUT, PATCH, DELETE
`).join('')}

## 🧪 Pruebas

### Backend
\`\`\`bash
cd backend
./mvnw test
\`\`\`

### Frontend
\`\`\`bash
cd frontend
flutter test
\`\`\`

## 🔧 Configuración Avanzada

### Cambiar Puerto del Backend
1. Modificar \`backend/src/main/resources/application.properties\`:
   \`\`\`properties
   server.port=8081
   \`\`\`

2. Actualizar \`frontend/lib/config/api_config.dart\`:
   \`\`\`dart
   static const String baseUrl = 'http://localhost:8081/api';
   \`\`\`

### Usar IP Real (Dispositivos Físicos)
Para probar en dispositivos físicos, usar la IP de tu computadora:

\`\`\`dart
// En frontend/lib/config/api_config.dart
static const String baseUrl = 'http://192.168.1.100:${backendPort}/api';
\`\`\`

## 🚀 Despliegue

### Backend (Producción)
1. Compilar JAR: \`./mvnw clean package\`
2. Ejecutar: \`java -jar target/demo-0.0.1-SNAPSHOT.jar\`

### Frontend (Producción)
1. Compilar APK: \`flutter build apk --release\`
2. Instalar: \`flutter install\`

## 📝 Notas Importantes

- El backend usa H2 Database en memoria por defecto
- Para producción, configurar PostgreSQL o MySQL
- El frontend está optimizado para Android e iOS
- La conexión es automática, no requiere configuración manual

## 🆘 Solución de Problemas

### Backend no inicia
- Verificar que Java 17+ esté instalado
- Verificar que el puerto ${backendPort} esté libre
- Revisar logs en consola

### Frontend no se conecta
- Verificar que el backend esté ejecutándose
- Verificar la IP en \`api_config.dart\`
- Verificar conectividad de red

### Errores de compilación
- Ejecutar \`flutter clean && flutter pub get\`
- Verificar versión de Flutter: \`flutter --version\`

---

**Proyecto generado automáticamente desde diagrama UML**
**Fecha de generación**: ${new Date().toLocaleString()}
**Entidades incluidas**: ${entities.join(', ')}
`;

  await fsPromises.writeFile(path.join(projectDir, 'README.md'), readmeContent);
}

// Crear scripts de ejecución
async function createExecutionScripts(projectDir, backendPort) {
  const scriptsDir = path.join(projectDir, 'scripts');
  await fsPromises.mkdir(scriptsDir, { recursive: true });

  // Script para Windows
  const windowsScript = `@echo off
echo 🚀 Iniciando Sistema Full-Stack
echo.

echo 📱 Iniciando Backend Spring Boot...
start "Backend" cmd /k "cd backend && ./mvnw.cmd spring-boot:run"

timeout /t 10 /nobreak >nul

echo 📱 Iniciando Frontend Flutter...
start "Frontend" cmd /k "cd frontend && flutter run"

echo ✅ Sistema iniciado correctamente
echo Backend: http://localhost:${backendPort}
echo Frontend: Ejecutándose en dispositivo/emulador
pause`;

  await fsPromises.writeFile(path.join(scriptsDir, 'start-windows.bat'), windowsScript);

  // Script para Linux/Mac
  const unixScript = `#!/bin/bash
echo "🚀 Iniciando Sistema Full-Stack"
echo

echo "📱 Iniciando Backend Spring Boot..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!

echo "Esperando 10 segundos para que el backend inicie..."
sleep 10

echo "📱 Iniciando Frontend Flutter..."
cd ../frontend
flutter run &
FRONTEND_PID=$!

echo "✅ Sistema iniciado correctamente"
echo "Backend: http://localhost:${backendPort}"
echo "Frontend: Ejecutándose en dispositivo/emulador"
echo "Presiona Ctrl+C para detener ambos servicios"

# Función para limpiar procesos al salir
cleanup() {
    echo "Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Esperar a que termine cualquiera de los procesos
wait`;

  await fsPromises.writeFile(path.join(scriptsDir, 'start-unix.sh'), unixScript);
  
  // Hacer ejecutable el script de Unix
  await fsPromises.chmod(path.join(scriptsDir, 'start-unix.sh'), '755');
}

module.exports = {
  generateFlutterWithBackend,
  generateFullStackProject
};

