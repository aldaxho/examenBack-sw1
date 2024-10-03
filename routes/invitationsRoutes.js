// routes/invitationsRoutes.js
const express = require('express');
const { generarCodigoInvitacion, invalidarCodigoInvitacion, obtenerUsuariosInvitados, aceptarInvitacion, obtenerDiagramasInvitado } = require('../controllers/invitacionController');
const { verificarToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(verificarToken);

// Rutas para invitaciones
router.post('/:diagramId/invitations', generarCodigoInvitacion);
router.delete('/:diagramId/invitations/:codigoInvitacion', invalidarCodigoInvitacion);
router.get('/:diagramId/users', obtenerUsuariosInvitados);
router.get('/invitados',obtenerDiagramasInvitado);

// Aceptar invitación
router.post('/accept', aceptarInvitacion);

module.exports = router;
