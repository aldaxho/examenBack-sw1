// utils/tempCleaner.js
const fs = require('fs').promises;
const path = require('path');

const TEMP_DIR = path.join(__dirname, '../temp');
const CLEANUP_INTERVAL_HOURS = 1; // Limpiar cada hora
const FILE_MAX_AGE_HOURS = 2; // Eliminar archivos más viejos de 2 horas

/**
 * Limpia archivos temporales antiguos
 */
async function cleanupTempFiles() {
  try {
    // Verificar si el directorio temp existe
    try {
      await fs.access(TEMP_DIR);
    } catch (error) {
      console.log('📁 Directorio temp no existe, creándolo...');
      await fs.mkdir(TEMP_DIR, { recursive: true });
      return;
    }

    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const maxAge = FILE_MAX_AGE_HOURS * 60 * 60 * 1000; // Convertir a milisegundos
    
    let deletedCount = 0;
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      
      try {
        const stats = await fs.stat(filePath);
        const age = now - stats.mtime.getTime();
        
        if (age > maxAge) {
          if (stats.isDirectory()) {
            await fs.rm(filePath, { recursive: true, force: true });
            console.log(`🗑️ Directorio eliminado: ${file} (${Math.round(age / (60 * 60 * 1000))}h de antigüedad)`);
          } else {
            totalSize += stats.size;
            await fs.unlink(filePath);
            console.log(`🗑️ Archivo eliminado: ${file} (${Math.round(age / (60 * 60 * 1000))}h de antigüedad)`);
          }
          deletedCount++;
        }
      } catch (error) {
        console.warn(`⚠️ Error procesando ${file}:`, error.message);
      }
    }

    if (deletedCount > 0) {
      console.log(`✅ Limpieza completada: ${deletedCount} elementos eliminados (${Math.round(totalSize / 1024 / 1024)}MB liberados)`);
    } else {
      console.log('✨ Directorio temp limpio - no hay archivos antiguos para eliminar');
    }

  } catch (error) {
    console.error('❌ Error durante limpieza de archivos temporales:', error);
  }
}

/**
 * Inicia el programador de limpieza automática (usando setInterval)
 */
function startCleanupScheduler() {
  // Ejecutar limpieza inicial
  cleanupTempFiles();
  
  // Programar limpieza cada hora usando setInterval
  const intervalMs = CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000;
  setInterval(() => {
    console.log('🧹 Iniciando limpieza programada de archivos temporales...');
    cleanupTempFiles();
  }, intervalMs);
  
  console.log(`📅 Programador de limpieza temporal iniciado (cada ${CLEANUP_INTERVAL_HOURS} hora${CLEANUP_INTERVAL_HOURS > 1 ? 's' : ''})`);
}

/**
 * Elimina un directorio específico de forma manual
 */
async function cleanupSpecificDir(dirName) {
  try {
    const dirPath = path.join(TEMP_DIR, dirName);
    await fs.rm(dirPath, { recursive: true, force: true });
    console.log(`🗑️ Directorio específico eliminado: ${dirName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error eliminando directorio ${dirName}:`, error);
    return false;
  }
}

/**
 * Obtiene estadísticas del directorio temporal
 */
async function getTempStats() {
  try {
    const files = await fs.readdir(TEMP_DIR);
    let totalSize = 0;
    let fileCount = 0;
    let dirCount = 0;
    const now = Date.now();

    for (const file of files) {
      try {
        const stats = await fs.stat(path.join(TEMP_DIR, file));
        if (stats.isDirectory()) {
          dirCount++;
        } else {
          fileCount++;
          totalSize += stats.size;
        }
      } catch (error) {
        // Ignorar errores de archivos individuales
      }
    }

    return {
      totalFiles: fileCount,
      totalDirectories: dirCount,
      totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
      tempDir: TEMP_DIR
    };
  } catch (error) {
    return {
      totalFiles: 0,
      totalDirectories: 0,
      totalSizeMB: 0,
      tempDir: TEMP_DIR,
      error: error.message
    };
  }
}

module.exports = {
  startCleanupScheduler,
  cleanupTempFiles,
  cleanupSpecificDir,
  getTempStats
};
