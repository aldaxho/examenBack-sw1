// Controlador para gestionar los diagramas UML
const { Diagrama } = require('../models');

// Crear un nuevo diagrama
exports.crearDiagrama = async (req, res) => {
  const { titulo, contenido } = req.body;
  const usuarioId = req.user.id;

  try {
    console.log('Creando nuevo diagrama:');
    console.log('Titulo:', titulo);
    console.log('Usuario ID:', usuarioId);
    
    const nuevoDiagrama = await Diagrama.create({
      titulo,
      contenido,
      usuarioId,
    });
    
    res.status(201).json(nuevoDiagrama);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el diagrama.', error });
  }
};

// Obtener todos los diagramas del usuario
exports.obtenerDiagramas = async (req, res) => {
  const usuarioId = req.user.id;
  
  try {
    console.log('Obteniendo diagramas para el usuario:', usuarioId);
    const diagramas = await Diagrama.findAll({ where: { usuarioId } });
    console.log('Diagramas encontrados:', diagramas.length);
    res.status(200).json(diagramas);
  } catch (error) {
    console.error('Error al obtener los diagramas:', error);
    res.status(500).json({ mensaje: 'Error al obtener los diagramas.', error });
  }
};

// Actualizar un diagrama existente
exports.actualizarDiagrama = async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido, lastUpdatedAt } = req.body;
  
  try {
    const diagrama = await Diagrama.findByPk(id);
    if (!diagrama) {
      return res.status(404).json({ mensaje: 'Diagrama no encontrado.' });
    }
    
    // Protección contra actualizaciones desactualizadas
    // Si el cliente tiene datos muy antiguos (más de 3 segundos), rechazar la actualización
    if (lastUpdatedAt && diagrama.updatedAt) {
      const clientTimestamp = new Date(lastUpdatedAt);
      const serverTimestamp = new Date(diagrama.updatedAt);
      const timeDiffSeconds = (serverTimestamp - clientTimestamp) / 1000;
      
      // Solo rechazar si la diferencia es mayor a 3 segundos
      if (timeDiffSeconds > 3) {
        console.log(`Actualización rechazada: datos desactualizados por ${timeDiffSeconds.toFixed(2)} segundos`);
        return res.status(409).json({ 
          mensaje: 'El diagrama ha sido actualizado recientemente. Por favor, recarga.',
          needsReload: true,
          currentDiagram: diagrama
        });
      }
    }
    
    await diagrama.update({ titulo, contenido });
    res.status(200).json(diagrama);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el diagrama.', error });
  }
};

// Obtener un diagrama por su ID
exports.obtenerDiagramaPorId = async (req, res) => {
  const { id } = req.params;
  
  try {
    const diagrama = await Diagrama.findByPk(id);

    if (!diagrama) {
      return res.status(404).json({ mensaje: 'Diagrama no encontrado.' });
    }

    res.status(200).json(diagrama);
  } catch (error) {
    console.error('Error al obtener el diagrama:', error);
    res.status(500).json({ mensaje: 'Error al obtener el diagrama.', error });
  }
};

// Eliminar un diagrama
exports.eliminarDiagrama = async (req, res) => {
  const { id } = req.params;
  
  try {
    const diagrama = await Diagrama.findByPk(id);
    if (!diagrama) {
      return res.status(404).json({ mensaje: 'Diagrama no encontrado.' });
    }
    
    await diagrama.destroy();
    res.status(200).json({ mensaje: 'Diagrama eliminado.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el diagrama.', error });
  }
};
