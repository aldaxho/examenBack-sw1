#!/usr/bin/env node
// Script para verificar que todas las variables de entorno estén configuradas

require('dotenv').config();

const requiredVars = [
  'NODE_ENV',
  'JWT_SECRET',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD'
];

const optionalVars = [
  'AGENT_URL',
  'AGENT_TOKEN',
  'FRONT_ORIGIN',
  'PORT'
];

console.log('🔍 Verificando configuración de producción...\n');

let hasErrors = false;

// Verificar variables requeridas
console.log('✅ Variables requeridas:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`   ❌ ${varName}: NO CONFIGURADA`);
    hasErrors = true;
  } else {
    // Ocultar valores sensibles
    const displayValue = ['PASSWORD', 'SECRET', 'TOKEN', 'KEY'].some(s => varName.includes(s))
      ? '***' + value.slice(-4)
      : value.length > 30 
        ? value.substring(0, 30) + '...'
        : value;
    console.log(`   ✓ ${varName}: ${displayValue}`);
  }
});

console.log('\n📝 Variables opcionales:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`   ⚠️  ${varName}: No configurada (opcional)`);
  } else {
    const displayValue = ['PASSWORD', 'SECRET', 'TOKEN', 'KEY'].some(s => varName.includes(s))
      ? '***' + value.slice(-4)
      : value.length > 30 
        ? value.substring(0, 30) + '...'
        : value;
    console.log(`   ✓ ${varName}: ${displayValue}`);
  }
});

console.log('\n🔐 Verificación de seguridad:');

// Verificar JWT_SECRET
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.log('   ⚠️  JWT_SECRET es muy corto (recomendado: 64+ caracteres)');
  hasErrors = true;
} else if (process.env.JWT_SECRET) {
  console.log('   ✓ JWT_SECRET tiene longitud adecuada');
}

// Verificar NODE_ENV
if (process.env.NODE_ENV !== 'production') {
  console.log('   ⚠️  NODE_ENV no está en "production"');
} else {
  console.log('   ✓ NODE_ENV está en producción');
}

// Verificar DB_SSL si estamos en producción
if (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'true') {
  console.log('   ⚠️  DB_SSL debería ser "true" en producción');
}

console.log('\n');

if (hasErrors) {
  console.log('❌ HAY ERRORES DE CONFIGURACIÓN. Por favor, revisa las variables faltantes.\n');
  process.exit(1);
} else {
  console.log('✅ CONFIGURACIÓN CORRECTA. Todo listo para producción!\n');
  process.exit(0);
}
