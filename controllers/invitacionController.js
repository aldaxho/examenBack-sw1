// controllers/invitacionController.js
const { Diagrama, DiagramaUsuario, Usuario } = require('../models');
const { Op } = require('sequelize'); // Importa los operadores de Sequelize

function generateUniqueCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Obtener diagramas donde el usuario está invitado

exports.obtenerDiagramasInvitado = async (req, res) => {
  const userId = req.user.id;

  try {
      // Obtener solo los diagramas donde el usuario ha sido invitado y no es el propietario
      const invitaciones = await DiagramaUsuario.findAll({
          where: {
              usuarioId: userId,
              estado: 'aceptado',
          },
          include: [
              {
                  model: Diagrama,
                  where: {
                      usuarioId: { [Op.ne]: userId }  // Filtrar diagramas que no hayas creado tú mismo
                  },
                  include: [
                      {
                          model: Usuario,
                          attributes: ['nombre'],
                          // Elimina 'as: propietario' si no has configurado un alias en el modelo
                      },
                  ],
              },
          ],
      });

      // Mapear los diagramas invitados
      const diagramasInvitados = invitaciones.map(inv => ({
          id: inv.diagramaId,
          titulo: inv.Diagrama?.titulo, // Asegúrate de que el título exista
          propietarioNombre: inv.Diagrama?.Usuario?.nombre || 'Propietario no encontrado',
      }));

      res.json(diagramasInvitados);
  } catch (error) {
      console.error('Error al obtener diagramas invitados:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// Generar código de invitación
exports.generarCodigoInvitacion = async (req, res) => {
  const { diagramId } = req.params;
  const userId = req.user.id;
  const { permiso } = req.body; // 'editor' o 'lector'

  try {
    const diagrama = await Diagrama.findByPk(diagramId);
    if (!diagrama) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }
    if (diagrama.usuarioId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para generar códigos de invitación para este diagrama' });
    }

    const codigoInvitacion = generateUniqueCode();

    const invitacion = await DiagramaUsuario.create({
      diagramaId: diagramId,
      usuarioId: null, // El usuario se asigna al aceptar la invitación
      permiso,
      estado: 'pendiente',
      codigoInvitacion,
      isValid: true,
    });

    res.json({ codigoInvitacion });
  } catch (error) {
    console.error('Error al generar código de invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Invalidar código de invitación
exports.invalidarCodigoInvitacion = async (req, res) => {
  const { diagramId, codigoInvitacion } = req.params;
  const userId = req.user.id;

  try {
    const diagrama = await Diagrama.findByPk(diagramId);
    if (!diagrama) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }
    if (diagrama.usuarioId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para invalidar códigos de invitación para este diagrama' });
    }

    const invitacion = await DiagramaUsuario.findOne({ where: { diagramaId: diagramId, codigoInvitacion } });
    if (!invitacion) {
      return res.status(404).json({ error: 'Código de invitación no encontrado' });
    }

    invitacion.isValid = false;
    invitacion.estado = 'rechazado';
    await invitacion.save();

    res.json({ message: 'Código de invitación invalidado con éxito' });
  } catch (error) {
    console.error('Error al invalidar código de invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener usuarios invitados
// Controlador para obtener los usuarios invitados de un diagrama
exports.obtenerUsuariosInvitados = async (req, res) => {
  const { diagramId } = req.params;

  try {
    const usuarios = await DiagramaUsuario.findAll({
      where: { diagramaId: diagramId, estado: 'aceptado' },
      include: [{ model: Usuario, attributes: ['id', 'nombre', 'correo'] }],
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener los usuarios invitados:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios invitados' });
  }
};


// Aceptar invitación
exports.aceptarInvitacion = async (req, res) => {
  const { codigoInvitacion } = req.body;
  const userId = req.user.id;

  try {
    const invitacion = await DiagramaUsuario.findOne({
      where: { codigoInvitacion, isValid: true },
    });

    if (!invitacion) {
      return res.status(400).json({ error: 'Código de invitación inválido o expirado' });
    }

    invitacion.usuarioId = userId;
    invitacion.estado = 'aceptado';
    invitacion.isValid = false; // Invalidar el código si es de un solo uso
    await invitacion.save();

    res.json({ message: 'Te has unido al diagrama', diagramaId: invitacion.diagramaId });
  } catch (error) {
    console.error('Error al aceptar la invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
