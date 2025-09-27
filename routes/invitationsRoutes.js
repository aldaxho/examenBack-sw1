// routes/invitationsRoutes.js
const express = require('express');
const { 
  generarCodigoInvitacion, 
  invalidarCodigoInvitacion, 
  obtenerUsuariosInvitados, 
  aceptarInvitacion, 
  obtenerDiagramasInvitado,
  cambiarPermisos,
  eliminarUsuario,
  obtenerUsuariosDiagrama,
  validarCodigoInvitacion,
  listarInvitaciones,
  regenerarCodigoInvitacion,
  reenviarCodigoInvitacion
} = require('../controllers/invitacionController');
const { verificarToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(verificarToken);

// Endpoint de prueba para verificar que las rutas funcionan
router.get('/test', (req, res) => {
  res.json({ message: 'Rutas de invitaciones funcionando correctamente' });
});

// Rutas específicas primero (para evitar conflictos con parámetros dinámicos)
router.get('/invitados', obtenerDiagramasInvitado);
router.post('/accept', aceptarInvitacion);
router.get('/code/:codigoInvitacion', validarCodigoInvitacion);
router.post('/generate', async (req, res) => {
  // Este endpoint necesita diagramId en el body
  const { diagramId, permiso } = req.body;
  if (!diagramId) {
    return res.status(400).json({ error: 'diagramId es requerido' });
  }
  // Redirigir al endpoint correcto
  req.params.diagramId = diagramId;
  return generarCodigoInvitacion(req, res);
});

// Rutas con parámetros dinámicos al final
router.get('/:diagramId/invitations/all', listarInvitaciones);
router.post('/:diagramId/invitations/:codigoInvitacion/regenerate', regenerarCodigoInvitacion);
router.get('/:diagramId/invitations/:codigoInvitacion/resend', reenviarCodigoInvitacion);
router.post('/:diagramId/invitations', generarCodigoInvitacion);
router.delete('/:diagramId/invitations/:codigoInvitacion', invalidarCodigoInvitacion);
router.put('/:id/permissions', cambiarPermisos);
router.delete('/:id/users', eliminarUsuario);
router.get('/:id/users', obtenerUsuariosDiagrama);
router.get('/:diagramId/users', obtenerUsuariosInvitados);

module.exports = router;
