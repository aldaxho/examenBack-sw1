const { generateSimpleSpringBootProject } = require('./utils/simpleSpringBootGenerator');
const { Diagrama } = require('./models');
const fs = require('fs').promises;
const path = require('path');

async function testGenerator() {
  try {
    console.log('🔍 Buscando diagrama...');
    const diagrama = await Diagrama.findByPk('483c629b-5155-4039-a3a8-f50697ef31bc');
    
    if (!diagrama) {
      console.error('❌ Diagrama no encontrado');
      process.exit(1);
    }
    
    console.log(`📋 Diagrama encontrado: ${diagrama.titulo}`);
    console.log('🚀 Generando proyecto Spring Boot...\n');
    
    const result = await generateSimpleSpringBootProject(diagrama.contenido, diagrama.titulo);
    
    console.log('\n✅ Proyecto generado exitosamente');
    console.log(`📁 Ubicación: ${result.projectPath}`);
    console.log(`📦 Entidades: ${result.entities.join(', ')}`);
    
    // Verificar el wrapper JAR
    const wrapperJarPath = path.join(result.projectPath, '.mvn', 'wrapper', 'maven-wrapper.jar');
    
    try {
      const stats = await fs.stat(wrapperJarPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      
      console.log('\n🔍 Verificando Maven Wrapper JAR:');
      console.log(`   Ruta: ${wrapperJarPath}`);
      console.log(`   Tamaño: ${stats.size} bytes (${sizeMB} MB)`);
      
      if (stats.size >= 50000) {
        console.log('   ✅ Tamaño correcto (>= 50 KB)');
        console.log('\n🎉 TEST PASADO: El wrapper JAR se descargó correctamente');
      } else {
        console.log(`   ❌ Tamaño incorrecto (esperaba >= 50 KB, obtuvo ${sizeMB} MB)`);
        console.log('\n⚠️ TEST FALLIDO: El wrapper JAR está corrupto');
        process.exit(1);
      }
      
      // Verificar que existen los scripts
      const mvnwCmd = path.join(result.projectPath, 'mvnw.cmd');
      const mvnw = path.join(result.projectPath, 'mvnw');
      
      const mvnwCmdExists = await fs.access(mvnwCmd).then(() => true).catch(() => false);
      const mvnwExists = await fs.access(mvnw).then(() => true).catch(() => false);
      
      console.log('\n🔍 Verificando scripts Maven Wrapper:');
      console.log(`   mvnw.cmd: ${mvnwCmdExists ? '✅' : '❌'}`);
      console.log(`   mvnw: ${mvnwExists ? '✅' : '❌'}`);
      
    } catch (error) {
      console.log('\n❌ ERROR: Maven Wrapper JAR no encontrado');
      console.log(`   Esperado en: ${wrapperJarPath}`);
      
      // Verificar si existe FIX_MAVEN_WRAPPER.md
      const fixFile = path.join(result.projectPath, 'FIX_MAVEN_WRAPPER.md');
      const fixExists = await fs.access(fixFile).then(() => true).catch(() => false);
      
      if (fixExists) {
        console.log(`\n📝 Archivo de reparación creado: FIX_MAVEN_WRAPPER.md`);
        console.log('   El generador no pudo descargar el JAR (posible firewall/proxy)');
      }
      
      console.log('\n⚠️ TEST FALLIDO: Maven Wrapper JAR no se generó');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Error durante la generación:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar test
testGenerator();
