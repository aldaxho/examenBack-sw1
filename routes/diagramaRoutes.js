// routes/diagramaRoutes.js
const express = require('express');
const { crearDiagrama, obtenerDiagramas, actualizarDiagrama, eliminarDiagrama } = require('../controllers/diagramaController');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const diagramaController = require('../controllers/diagramaController'); // Asegúrate de que la ruta sea correcta

router.use(verificarToken); // Aplicar el middleware a todas las rutas de diagramas

// Ruta para crear un nuevo diagrama
router.post('/', crearDiagrama);

// Ruta para obtener todos los diagramas del usuario
router.get('/', obtenerDiagramas);

//router.get('/:id', diagramaController.obtenerDiagramaPorId);
router.get('/:id', diagramaController.obtenerDiagramaPorId);

// Ruta para actualizar un diagrama
router.put('/:id', actualizarDiagrama);

// Ruta para eliminar un diagrama
router.delete('/:id', eliminarDiagrama);

module.exports = router;
