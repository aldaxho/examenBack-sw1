// controllers/diagramaController.js
const { Diagrama } = require('../models');

// Crear un nuevo diagrama
exports.crearDiagrama = async (req, res) => {
  const { titulo, contenido } = req.body;
  const usuarioId = req.user.id;

  try {
    console.log('Datos recibidos en backend:');
    console.log('Titulo:', titulo);
    console.log('Contenido:', contenido);
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
    console.log('Diagramas encontrados:', diagramas);
    res.status(200).json(diagramas);
  } catch (error) {
    console.error('Error al obtener los diagramas:', error);
    res.status(500).json({ mensaje: 'Error al obtener los diagramas.', error });
  }
};

// Actualizar un diagrama
exports.actualizarDiagrama = async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido } = req.body;
  try {
    const diagrama = await Diagrama.findByPk(id);
    if (!diagrama) {
      return res.status(404).json({ mensaje: 'Diagrama no encontrado.' });
    }
    await diagrama.update({ titulo, contenido });
    res.status(200).json(diagrama);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el diagrama.', error });
  }
};

// Obtener un diagrama por ID
exports.obtenerDiagramaPorId = async (req, res) => {
  const { id } = req.params; // Asegúrate de que estás usando el ID correctamente
  try {
    const diagrama = await Diagrama.findByPk(id); // Usar findByPk para buscar por clave primaria

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
