const { generateSimpleSpringBootProject } = require('../utils/simpleSpringBootGenerator');
const { Diagrama } = require('../models');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const archiver = require('archiver');

// Endpoint para generar Spring Boot con OpenAPI Generator
async function generateSpringBootWithOpenAPI(req, res) {
  const { id } = req.params;
  
  console.log('====================================================');
  console.log('[OPENAPI] Inicio de generación de backend');
  console.log('[OPENAPI] ID del diagrama:', id);
  console.log('[OPENAPI] Usuario autenticado:', req.user ? req.user.id : 'NO AUTENTICADO');
  console.log('====================================================');
  
  try {
    console.log(`[OPENAPI] Generando Spring Boot backend con OpenAPI para diagrama ID: ${id}`);
    
    // Obtener diagrama
    console.log('[OPENAPI] Buscando diagrama en la base de datos...');
    const diagrama = await Diagrama.findByPk(id);
    
    if (!diagrama) {
      console.error('[OPENAPI] ERROR: Diagrama no encontrado en la BD');
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }
    
    console.log('[OPENAPI] Diagrama encontrado exitosamente');

    console.log(` Diagrama encontrado: ${diagrama.titulo}`);
    
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

    // Generar proyecto Spring Boot con generador simple
    console.log('🔧 Generando proyecto con generador simple...');
    const result = await generateSimpleSpringBootProject(diagramaJSON, diagrama.titulo);
    
    if (!result.success) {
      return res.status(500).json({ 
        error: 'Error generando proyecto Spring Boot',
        details: result.error 
      });
    }

    console.log(` Proyecto generado: ${result.projectName}`);
    console.log(` Ubicación: ${result.projectPath}`);
    console.log(` Entidades: ${result.entities.join(', ')}`);

    // Crear ZIP del proyecto
    console.log('[OPENAPI] Creando archivo ZIP...');
    const zipPath = path.join(result.projectPath, `${result.projectName}.zip`);
    
    console.log('[OPENAPI] Llamando a createZipFile...');
    await createZipFile(result.projectPath, zipPath);
    console.log('[OPENAPI] createZipFile completado');
    
    // Verificar que el ZIP se creó correctamente
    console.log('[OPENAPI] Verificando archivo ZIP...');
    const zipStats = await fsPromises.stat(zipPath);
    console.log(`[OPENAPI] ZIP creado exitosamente: ${zipStats.size} bytes`);

    // Enviar el archivo ZIP como respuesta
    console.log('[OPENAPI] Configurando headers de respuesta...');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${result.projectName}.zip"`);
    res.setHeader('Content-Length', zipStats.size);
    
    console.log('[OPENAPI] Leyendo archivo ZIP en buffer...');
    const zipBuffer = await fsPromises.readFile(zipPath);
    console.log(`[OPENAPI] Buffer leído: ${zipBuffer.length} bytes`);
    
    console.log('[OPENAPI] Enviando respuesta al cliente...');
    res.send(zipBuffer);
    console.log('[OPENAPI] Respuesta enviada exitosamente');

    // Limpiar archivos temporales después de enviar
    setTimeout(async () => {
      try {
        await fsPromises.rm(result.projectPath, { recursive: true, force: true });
        console.log(` Directorio temporal limpiado: ${result.projectPath}`);
      } catch (cleanupError) {
        console.error('Error limpiando archivos temporales:', cleanupError);
      }
    }, 5000);

  } catch (error) {
    console.error('[OPENAPI] ========================================');
    console.error('[OPENAPI] ERROR CRÍTICO EN GENERACIÓN');
    console.error('[OPENAPI] Tipo:', error.name);
    console.error('[OPENAPI] Mensaje:', error.message);
    console.error('[OPENAPI] Stack:', error.stack);
    console.error('[OPENAPI] ========================================');
    
    // IMPORTANTE: Siempre enviar una respuesta, nunca cerrar la conexión sin respuesta
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

// Función para crear archivo ZIP
async function createZipFile(sourceDir, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(` ZIP creado: ${archive.pointer()} bytes`);
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

module.exports = {
  generateSpringBootWithOpenAPI
};
