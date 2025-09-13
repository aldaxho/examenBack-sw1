const fs = require('fs');
const path = require('path');

// Script para corregir campos duplicados en proyecto Spring Boot generado
async function fixDuplicateFields(projectPath) {
  console.log('🔧 Corrigiendo campos duplicados...');
  
  const modelDir = path.join(projectPath, 'src', 'main', 'java', 'com', 'example', 'demo', 'model');
  const dtoDir = path.join(projectPath, 'src', 'main', 'java', 'com', 'example', 'demo', 'dto');
  
  // Corregir archivos de modelo
  const modelFiles = await fs.promises.readdir(modelDir);
  for (const file of modelFiles) {
    if (file.endsWith('.java')) {
      await fixModelFile(path.join(modelDir, file));
    }
  }
  
  // Corregir archivos DTO
  const dtoFiles = await fs.promises.readdir(dtoDir);
  for (const file of dtoFiles) {
    if (file.endsWith('.java')) {
      await fixDTOFile(path.join(dtoDir, file));
    }
  }
  
  console.log('✅ Campos duplicados corregidos');
}

async function fixModelFile(filePath) {
  let content = await fs.promises.readFile(filePath, 'utf8');
  
  // Eliminar campos String id duplicados
  content = content.replace(/@Column\(name = "id"\)\s*private String id;\s*/g, '');
  
  // Eliminar métodos getId() y setId() duplicados con String
  content = content.replace(/public String getId\(\) \{\s*return id;\s*\}\s*/g, '');
  content = content.replace(/public void setId\(String id\) \{\s*this\.id = id;\s*\}\s*/g, '');
  
  await fs.promises.writeFile(filePath, content);
  console.log(`✅ Corregido: ${path.basename(filePath)}`);
}

async function fixDTOFile(filePath) {
  let content = await fs.promises.readFile(filePath, 'utf8');
  
  // Eliminar campos String id duplicados
  content = content.replace(/@Column\(name = "id"\)\s*private String id;\s*/g, '');
  
  // Eliminar métodos getId() y setId() duplicados con String
  content = content.replace(/public String getId\(\) \{\s*return id;\s*\}\s*/g, '');
  content = content.replace(/public void setId\(String id\) \{\s*this\.id = id;\s*\}\s*/g, '');
  
  await fs.promises.writeFile(filePath, content);
  console.log(`✅ Corregido: ${path.basename(filePath)}`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const projectPath = process.argv[2];
  if (!projectPath) {
    console.log('Uso: node fix-duplicate-fields.js <ruta-del-proyecto>');
    process.exit(1);
  }
  fixDuplicateFields(projectPath).catch(console.error);
}

module.exports = { fixDuplicateFields };
