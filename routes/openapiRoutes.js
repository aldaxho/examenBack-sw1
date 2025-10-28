// routes/openapiRoutes.js
const express = require('express');
const { generateSpringBootWithOpenAPI } = require('../controllers/openapiController');
const { generateFlutterWithBackend, generateFullStackProject } = require('../controllers/flutterController');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Ruta de prueba sin autenticación
router.get('/test', (req, res) => {
  res.json({ message: 'OpenAPI Generator routes working!' });
});

// Ruta de prueba para generar proyecto (SIN AUTENTICACIÓN)
router.post('/test-generate', async (req, res) => {
  try {
    const { generateSimpleSpringBootProject } = require('../utils/simpleSpringBootGenerator');
    
    const testData = {
      classes: [
        {
          id: '1',
          name: 'TestEntity',
          attributes: [
            { name: 'nombre', type: 'String' },
            { name: 'edad', type: 'Integer' }
          ]
        }
      ]
    };
    
    console.log('Probando generador simple...');
    const result = await generateSimpleSpringBootProject(testData, 'Test Project');
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Generador simple funciona correctamente!',
        projectName: result.projectName,
        entities: result.entities
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error en test:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Aplicar middleware de autenticación solo a rutas protegidas
router.use(verificarToken);

// Ruta para generar Spring Boot con OpenAPI Generator (CONFIABLE)
router.post('/generate-backend/:id', generateSpringBootWithOpenAPI);

// Rutas para generar Flutter
router.post('/generate-flutter/:id', generateFlutterWithBackend);

// Ruta para generar proyecto completo (Backend + Frontend)
router.post('/generate-fullstack/:id', generateFullStackProject);

module.exports = router;
