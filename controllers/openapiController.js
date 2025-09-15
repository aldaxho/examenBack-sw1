const { generateSimpleSpringBootProject } = require('../utils/simpleSpringBootGenerator');
const { Diagrama } = require('../models');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const archiver = require('archiver');

// Endpoint para generar Spring Boot con OpenAPI Generator
async function generateSpringBootWithOpenAPI(req, res) {
  const { id } = req.params;
  
  try {
    console.log(` Generando Spring Boot backend con OpenAPI para diagrama ID: ${id}`);
    
    // Obtener diagrama
    const diagrama = await Diagrama.findByPk(id);
    if (!diagrama) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }

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
    console.log(' Creando archivo ZIP...');
    const zipPath = path.join(result.projectPath, `${result.projectName}.zip`);
    
    await createZipFile(result.projectPath, zipPath);
    
    // Verificar que el ZIP se creó correctamente
    const zipStats = await fsPromises.stat(zipPath);
    console.log(` ZIP creado: ${zipStats.size} bytes`);

    // Enviar el archivo ZIP como respuesta
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${result.projectName}.zip"`);
    
    const zipBuffer = await fsPromises.readFile(zipPath);
    res.send(zipBuffer);

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
    console.error('Error al generar backend con OpenAPI:', error);
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
