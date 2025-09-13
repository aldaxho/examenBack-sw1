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

// Rutas específicas primero (para evitar conflictos)
router.get('/invitados', obtenerDiagramasInvitado);
router.post('/accept', aceptarInvitacion);
router.get('/code/:codigoInvitacion', validarCodigoInvitacion); // Nuevo endpoint para validar código
// Gestión adicional de invitaciones (propietario)
router.get('/:diagramId/invitations/all', listarInvitaciones);
router.post('/:diagramId/invitations/:codigoInvitacion/regenerate', regenerarCodigoInvitacion);
router.get('/:diagramId/invitations/:codigoInvitacion/resend', reenviarCodigoInvitacion);

// Rutas para invitaciones con diagramId
router.post('/:diagramId/invitations', generarCodigoInvitacion);
router.delete('/:diagramId/invitations/:codigoInvitacion', invalidarCodigoInvitacion);

// Rutas para gestión de usuarios (usar diferentes paths para evitar conflictos)
router.put('/:id/permissions', cambiarPermisos);     // Cambiar permisos de usuario
router.delete('/:id/users', eliminarUsuario);        // Eliminar usuario del diagrama
router.get('/:id/users', obtenerUsuariosDiagrama);   // Obtener usuarios de un diagrama

// Mantener compatibilidad con ruta anterior
router.get('/:diagramId/users', obtenerUsuariosInvitados);

module.exports = router;
