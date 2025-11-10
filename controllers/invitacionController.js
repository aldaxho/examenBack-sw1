// Controlador de invitaciones y colaboración en diagramas
const { Diagrama, DiagramaUsuario, Usuario } = require('../models');
const { Op, UniqueConstraintError } = require('sequelize');

// Generar un código aleatorio de 8 caracteres para invitaciones
function generateUniqueCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Verificar si un usuario es el dueño de un diagrama
async function checkIfOwner(diagramaId, userId) {
  try {
    const diagrama = await Diagrama.findByPk(diagramaId);
    return diagrama && diagrama.usuarioId === userId;
  } catch (error) {
    return false;
  }
}

// Obtener los diagramas donde el usuario ha sido invitado (no es el dueño)
exports.obtenerDiagramasInvitado = async (req, res) => {
  const userId = req.user.id;

  try {
    // Buscar todas las invitaciones aceptadas del usuario
    const invitaciones = await DiagramaUsuario.findAll({
      where: {
        usuarioId: userId,
        estado: 'aceptado',
      },
      include: [
        {
          model: Diagrama,
          where: {
            usuarioId: { [Op.ne]: userId }  // Solo diagramas que NO sean del usuario
          },
          include: [
            {
              model: Usuario,
              attributes: ['nombre'],
            },
          ],
        },
      ],
    });

    // Preparar la respuesta con los datos relevantes
    const diagramasInvitados = invitaciones.map(inv => ({
      id: inv.diagramaId,
      titulo: inv.Diagrama?.titulo,
      propietarioNombre: inv.Diagrama?.Usuario?.nombre || 'Propietario no encontrado',
    }));

    res.json(diagramasInvitados);
  } catch (error) {
    console.error('Error al obtener diagramas invitados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Generar un código de invitación para compartir un diagrama
exports.generarCodigoInvitacion = async (req, res) => {
  const { diagramId } = req.params;
  const userId = req.user.id;
  const { permiso } = req.body; // 'editor' o 'lector'

  try {
    // Verificar que el diagrama existe
    const diagrama = await Diagrama.findByPk(diagramId);
    if (!diagrama) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }
    
    // Solo el dueño puede generar códigos de invitación
    if (diagrama.usuarioId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para generar códigos de invitación para este diagrama' });
    }

    // Invalidar códigos anteriores que estén pendientes
    await DiagramaUsuario.update(
      { isValid: false, estado: 'rechazado' },
      { 
        where: { 
          diagramaId: diagramId, 
          usuarioId: null, 
          estado: 'pendiente',
          isValid: true 
        } 
      }
    );

    // Generar nuevo código de invitación
    const codigoInvitacion = generateUniqueCode();

    const invitacion = await DiagramaUsuario.create({
      diagramaId: diagramId,
      usuarioId: null, // Se asignará cuando alguien acepte
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

// Invalidar (cancelar) un código de invitación
exports.invalidarCodigoInvitacion = async (req, res) => {
  const { diagramId, codigoInvitacion } = req.params;
  const userId = req.user.id;

  try {
    const diagrama = await Diagrama.findByPk(diagramId);
    if (!diagrama) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }
    
    // Solo el dueño puede invalidar códigos
    if (diagrama.usuarioId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para invalidar códigos de invitación para este diagrama' });
    }

    const invitacion = await DiagramaUsuario.findOne({ where: { diagramaId: diagramId, codigoInvitacion } });
    if (!invitacion) {
      return res.status(404).json({ error: 'Código de invitación no encontrado' });
    }

    // Marcar como inválido
    invitacion.isValid = false;
    invitacion.estado = 'rechazado';
    await invitacion.save();

    res.json({ message: 'Código de invitación invalidado con éxito' });
  } catch (error) {
    console.error('Error al invalidar código de invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener la lista de usuarios que tienen acceso a un diagrama
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
  const userId = req.user.id;

  // Aceptar múltiples posibles nombres de campo desde el frontend
  const rawCode = (req.body?.codigoInvitacion || req.body?.invitacionId || req.body?.codigo || req.body?.code || '').toString();
  const normalizedCode = rawCode.trim();

  if (!normalizedCode) {
    return res.status(400).json({ error: 'Se requiere el código de invitación (campo aceptado: codigoInvitacion | invitacionId | codigo | code)' });
  }

  try {
    const invitacion = await DiagramaUsuario.findOne({
      where: { codigoInvitacion: normalizedCode, isValid: true },
    });

    if (!invitacion) {
      return res.status(400).json({ error: 'Código de invitación inválido o expirado' });
    }

    // Verificar si el usuario es el propietario del diagrama
    const diagrama = await Diagrama.findByPk(invitacion.diagramaId);
    if (!diagrama) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }
    if (diagrama.usuarioId === userId) {
      invitacion.isValid = false;
      invitacion.estado = 'aceptado';
      await invitacion.save().catch(() => {});
      return res.status(200).json({ message: 'Ya eres el propietario de este diagrama', diagramaId: diagrama.id });
    }

    // Verificar si ya existe una relación para este usuario y diagrama (ya pertenece)
    const yaMiembro = await DiagramaUsuario.findOne({
      where: { diagramaId: invitacion.diagramaId, usuarioId: userId, estado: 'aceptado' }
    });
    if (yaMiembro) {
      invitacion.isValid = false;
      await invitacion.save().catch(() => {});
      return res.json({ message: 'Ya perteneces a este diagrama', diagramaId: invitacion.diagramaId });
    }

    // Verificar si existe otra invitación pendiente para el mismo usuario y diagrama
    const invitacionExistente = await DiagramaUsuario.findOne({
      where: { 
        diagramaId: invitacion.diagramaId, 
        usuarioId: userId, 
        estado: 'pendiente' 
      }
    });

    if (invitacionExistente) {
      // Si existe otra invitación pendiente, invalidarla y usar la actual
      invitacionExistente.isValid = false;
      invitacionExistente.estado = 'rechazado';
      await invitacionExistente.save().catch(() => {});
    }

    // Aceptar invitación normalmente
    invitacion.usuarioId = userId;
    invitacion.estado = 'aceptado';
    invitacion.isValid = false;
    await invitacion.save();

    res.json({ message: 'Te has unido al diagrama', diagramaId: invitacion.diagramaId });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      // Si aún hay conflicto de restricción única, intentar limpiar registros duplicados
      try {
        console.log('Conflicto de restricción única detectado, limpiando registros duplicados...');
        
        // Buscar y eliminar registros duplicados para este usuario y diagrama
        const registrosDuplicados = await DiagramaUsuario.findAll({
          where: { 
            diagramaId: invitacion.diagramaId, 
            usuarioId: userId 
          },
          order: [['createdAt', 'ASC']]
        });

        if (registrosDuplicados.length > 1) {
          // Mantener solo el más reciente y eliminar los demás
          const mantener = registrosDuplicados[registrosDuplicados.length - 1];
          const eliminar = registrosDuplicados.slice(0, -1);
          
          for (const registro of eliminar) {
            await registro.destroy();
          }
          
          // Intentar aceptar la invitación nuevamente
          invitacion.usuarioId = userId;
          invitacion.estado = 'aceptado';
          invitacion.isValid = false;
          await invitacion.save();
          
          return res.json({ message: 'Te has unido al diagrama', diagramaId: invitacion.diagramaId });
        }
      } catch (cleanupError) {
        console.error('Error durante limpieza de duplicados:', cleanupError);
      }
      
      return res.status(409).json({ error: 'Ya existe una invitación aceptada para este diagrama y usuario' });
    }
    console.error('Error al aceptar la invitación (detalle):', error?.message, error?.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Validar / inspeccionar un código antes de aceptarlo
exports.validarCodigoInvitacion = async (req, res) => {
  const { codigoInvitacion } = req.params;
  const userId = req.user.id;
  try {
    if (!codigoInvitacion) {
      return res.status(400).json({ error: 'Código requerido' });
    }
    const invitacion = await DiagramaUsuario.findOne({
      where: { codigoInvitacion: codigoInvitacion.trim() },
      include: [{ model: Diagrama, include: [{ model: Usuario, as: 'propietario', attributes: ['id','nombre','correo'] }] }]
    });
    if (!invitacion) {
      return res.status(404).json({ error: 'Código no encontrado' });
    }
    const yaMiembro = await DiagramaUsuario.findOne({
      where: { diagramaId: invitacion.diagramaId, usuarioId: userId, estado: 'aceptado' }
    });
    res.json({
      valido: invitacion.isValid && invitacion.estado === 'pendiente',
      estado: invitacion.estado,
      diagramaId: invitacion.diagramaId,
      yaMiembro: !!yaMiembro,
      esPropietario: invitacion.Diagrama?.usuarioId === userId,
      permiso: invitacion.permiso
    });
  } catch (error) {
    console.error('Error al validar código invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Cambiar permisos de usuario
exports.cambiarPermisos = async (req, res) => {
  try {
    const { usuarioId, permiso } = req.body;
    const diagramaId = req.params.id;
    const currentUserId = req.user.id;
    
    // Verificar que el usuario actual es propietario
    const isOwner = await checkIfOwner(diagramaId, currentUserId);
    if (!isOwner) {
      return res.status(403).json({ error: 'Solo propietarios pueden gestionar usuarios' });
    }

    // Validar que se proporcionaron los datos necesarios
    if (!usuarioId || !permiso) {
      return res.status(400).json({ error: 'usuarioId y permiso son requeridos' });
    }

    // Validar permisos válidos
    const permisosValidos = ['lector', 'editor'];
    if (!permisosValidos.includes(permiso)) {
      return res.status(400).json({ error: 'Permiso inválido. Debe ser lector o editor' });
    }
    
    // Cambiar permiso de usuario existente
    const [updatedRowsCount] = await DiagramaUsuario.update(
      { permiso: permiso },
      { 
        where: { 
          diagramaId: diagramaId,
          usuarioId: usuarioId,
          estado: 'aceptado'
        } 
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado en este diagrama' });
    }
    
    return res.json({ success: true, message: 'Permiso actualizado correctamente' });
    
  } catch (error) {
    console.error('Error al cambiar permisos:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar usuario del diagrama
exports.eliminarUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.body;
    const diagramaId = req.params.id;
    const currentUserId = req.user.id;
    
    // Verificar que el usuario actual es propietario
    const isOwner = await checkIfOwner(diagramaId, currentUserId);
    if (!isOwner) {
      return res.status(403).json({ error: 'Solo propietarios pueden gestionar usuarios' });
    }

    // Validar que se proporcionó el usuarioId
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId es requerido' });
    }

    // No permitir auto-eliminación
    if (usuarioId === currentUserId) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }
    
    // Eliminar usuario del diagrama
    const deletedRowsCount = await DiagramaUsuario.destroy({
      where: { 
        diagramaId: diagramaId,
        usuarioId: usuarioId,
        estado: 'aceptado'
      }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado en este diagrama' });
    }
    
    return res.json({ success: true, message: 'Usuario eliminado correctamente' });
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener usuarios de un diagrama específico
exports.obtenerUsuariosDiagrama = async (req, res) => {
  try {
    const diagramaId = req.params.id;
    const currentUserId = req.user.id;
    
    // Verificar que el diagrama existe
    const diagrama = await Diagrama.findByPk(diagramaId);
    if (!diagrama) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }
    
    // Verificar que el usuario tiene acceso al diagrama (es propietario o tiene una invitación aceptada)
    const esPropieatario = diagrama.usuarioId === currentUserId;
    
    if (!esPropieatario) {
      const invitacionUsuario = await DiagramaUsuario.findOne({
        where: {
          diagramaId: diagramaId,
          usuarioId: currentUserId,
          estado: 'aceptado'
        }
      });
      
      if (!invitacionUsuario) {
        return res.status(403).json({ error: 'No tienes acceso a este diagrama' });
      }
    }
    
    // Obtener todos los usuarios del diagrama
    const usuarios = await DiagramaUsuario.findAll({
      where: { 
        diagramaId: diagramaId,
        estado: 'aceptado',
        usuarioId: { [Op.ne]: null } // Excluir invitaciones pendientes sin usuario asignado
      },
      include: [{
        model: Usuario,
        attributes: ['id', 'nombre', 'correo']
      }]
    });
    
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios del diagrama:', error);
    res.status(500).json({ error: error.message });
  }
};

// Listar todas las invitaciones (propietario)
exports.listarInvitaciones = async (req, res) => {
  const { diagramId } = req.params;
  const userId = req.user.id;
  try {
    const diagrama = await Diagrama.findByPk(diagramId);
    if (!diagrama) return res.status(404).json({ error: 'Diagrama no encontrado' });
    if (diagrama.usuarioId !== userId) return res.status(403).json({ error: 'Solo el propietario puede listar invitaciones' });
    const invitaciones = await DiagramaUsuario.findAll({
      where: { diagramaId: diagramId },
      include: [{ model: Usuario, attributes: ['id','nombre','correo'] }],
      order: [['createdAt','DESC']]
    });
    res.json(invitaciones.map(inv => ({
      codigoInvitacion: inv.codigoInvitacion,
      estado: inv.estado,
      permiso: inv.permiso,
      isValid: inv.isValid,
      usuario: inv.Usuario ? { id: inv.Usuario.id, nombre: inv.Usuario.nombre, correo: inv.Usuario.correo } : null,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt
    })));
  } catch (error) {
    console.error('Error al listar invitaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Regenerar un código pendiente (propietario)
exports.regenerarCodigoInvitacion = async (req, res) => {
  const { diagramId, codigoInvitacion } = req.params;
  const userId = req.user.id;
  try {
    const diagrama = await Diagrama.findByPk(diagramId);
    if (!diagrama) return res.status(404).json({ error: 'Diagrama no encontrado' });
    if (diagrama.usuarioId !== userId) return res.status(403).json({ error: 'Solo el propietario puede regenerar códigos' });
    const invitacion = await DiagramaUsuario.findOne({ where: { diagramaId: diagramId, codigoInvitacion } });
    if (!invitacion) return res.status(404).json({ error: 'Invitación no encontrada' });
    if (invitacion.estado !== 'pendiente' || invitacion.usuarioId) {
      return res.status(400).json({ error: 'Solo se pueden regenerar códigos pendientes sin usuario' });
    }
    invitacion.isValid = false;
    invitacion.estado = 'rechazado';
    await invitacion.save();
    const nuevoCodigo = generateUniqueCode();
    const nueva = await DiagramaUsuario.create({
      diagramaId: diagramId,
      usuarioId: null,
      permiso: invitacion.permiso,
      estado: 'pendiente',
      codigoInvitacion: nuevoCodigo,
      isValid: true
    });
    res.json({ old: codigoInvitacion, nuevo: nuevoCodigo, permiso: nueva.permiso });
  } catch (error) {
    console.error('Error al regenerar invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Reenviar (solo devolver) un código pendiente (propietario)
exports.reenviarCodigoInvitacion = async (req, res) => {
  const { diagramId, codigoInvitacion } = req.params;
  const userId = req.user.id;
  try {
    const diagrama = await Diagrama.findByPk(diagramId);
    if (!diagrama) return res.status(404).json({ error: 'Diagrama no encontrado' });
    if (diagrama.usuarioId !== userId) return res.status(403).json({ error: 'Solo el propietario puede reenviar códigos' });
    const invitacion = await DiagramaUsuario.findOne({ where: { diagramaId: diagramId, codigoInvitacion } });
    if (!invitacion) return res.status(404).json({ error: 'Invitación no encontrada' });
    if (!(invitacion.isValid && invitacion.estado === 'pendiente')) {
      return res.status(400).json({ error: 'El código ya no está disponible' });
    }
    res.json({ codigoInvitacion: invitacion.codigoInvitacion, permiso: invitacion.permiso });
  } catch (error) {
    console.error('Error al reenviar invitación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
