// Controlador para el asistente de IA
const { callAgent } = require('../services/agentService');
const { Diagrama, DiagramaUsuario } = require('../models');

// Función para analizar y generar diagramas con la IA
async function analyze(req, res) {
  try {
    let { diagram, intent, user_message, diagramId } = req.body || {};
    const forceMock = (req.query.forceMock === 'true');

    // Si tenemos un ID de diagrama, cargarlo desde la base de datos
    if (!diagram && diagramId) {
      try {
        const existente = await Diagrama.findByPk(diagramId);
        if (existente) {
          diagram = existente.contenido || { titulo: existente.titulo || 'Sin título', classes: [], relations: [] };
          if (!diagram.titulo) diagram.titulo = existente.titulo || 'Sin título';
        }
      } catch (e) {
        console.warn('No se pudo cargar diagrama por diagramId:', diagramId, e.message);
      }
    }

    // Si no hay diagrama, crear uno vacío
    const baseDiagram = diagram ?? { titulo: 'Sin título', classes: [], relations: [] };

    // Usar el mensaje del usuario como título si no hay uno
    if ((!baseDiagram.titulo || baseDiagram.titulo === 'Sin título') && user_message) {
      baseDiagram.titulo = user_message.slice(0, 80);
    }

    // Llamar al agente de IA para procesar el diagrama
    const data = await callAgent({ diagram: baseDiagram, intent: intent || 'free_chat', user_message: user_message || '', forceMock });

    // Validar que la respuesta del agente sea correcta
    if (!data || !data.analysis) {
      console.error('Respuesta inválida del agente:', data);
      return res.status(502).json({ error: 'invalid_agent_response', data });
    }
    return res.json({ ...data, diagramId: diagramId || null });
  } catch (err) {
    console.error('Error en analyze:', err);
    return res.status(500).json({ error: 'assistant_failed', detail: err.message });
  }
}

// Chatear con el agente sobre un diagrama específico
async function chatWithDiagram(req, res) {
  try {
    const { diagramId } = req.params;
    const { user_message, intent = 'chat' } = req.body;
    const userId = req.user.id;

    // Validar que tengamos los datos necesarios
    if (!diagramId || !user_message) {
      return res.status(400).json({ error: 'diagramId y user_message requeridos' });
    }

    // Buscar el diagrama en la base de datos
    const diagramaDB = await Diagrama.findByPk(diagramId);
    if (!diagramaDB) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }

    // Verificar que el usuario tenga permiso para editar este diagrama
    const tieneAcceso = diagramaDB.usuarioId === userId || 
      await DiagramaUsuario.findOne({
        where: { diagramaId: diagramId, usuarioId: userId, estado: 'aceptado' }
      });

    if (!tieneAcceso) {
      return res.status(403).json({ error: 'Sin acceso al diagrama' });
    }

    // Usar el diagrama que envió el cliente, o si no, el que está guardado
    const diagramaParaAgente = req.body && req.body.diagram ? req.body.diagram : (diagramaDB.contenido || diagramaDB);
    const usedSavedDiagram = !req.body || !req.body.diagram;

    // Llamar al agente de IA con el contexto del diagrama
    const data = await callAgent({
      diagram: diagramaParaAgente,
      intent,
      user_message
    });

    // Verificar si el agente propone cambios al diagrama
    const hasPatch = data.proposal?.patch &&
                     (Array.isArray(data.proposal.patch.classes) || Array.isArray(data.proposal.patch.relations));
    const hasAnyChanges = (data.proposal?.patch?.classes?.length > 0) || (data.proposal?.patch?.relations?.length > 0);

    // Si el agente hizo cambios, guardarlos y notificar a todos los usuarios
    if (hasPatch && hasAnyChanges) {
      const { patch } = data.proposal;

      // Recargar el diagrama desde la BD para tener la versión más actualizada
      await diagramaDB.reload();
      
      // Aplicar los cambios del agente al diagrama
      const baseDiagram = diagramaDB.contenido || diagramaDB;
      const updatedContent = applyPatchNewFormat(baseDiagram, patch);

      // Guardar el diagrama actualizado en la base de datos
      await diagramaDB.update({ contenido: updatedContent });

      // Notificar a todos los usuarios conectados mediante Socket.IO
      console.log('Enviando actualización del agente a la sala:', diagramId);
      console.log('  Clases en el diagrama actualizado:', (updatedContent.classes||[]).length);
      console.log('  Relaciones en el diagrama actualizado:', (updatedContent.relations||[]).length);

      req.app.get('io').to(diagramId).emit('agent-update', {
        type: 'diagram_modified',
        patch,
        updatedDiagram: updatedContent,
        message: data.messages?.[0] || 'Diagrama actualizado por el asistente',
        timestamp: new Date(),
        usedSavedDiagram
      });
    }

    // Devolver la respuesta del agente al cliente
    return res.json({
      ...data,
      diagramId,
      applied: !!(data.proposal?.patch?.classes?.length || data.proposal?.patch?.relations?.length),
      usedSavedDiagram
    });

  } catch (err) {
    console.error('Error en chatWithDiagram:', err);
    return res.status(500).json({ error: 'chat_failed', detail: err.message });
  }
}

// Función auxiliar: Aplicar cambios del agente al diagrama (formato nuevo)
// El agente envía un "patch" con clases y relaciones para agregar o actualizar
function applyPatchNewFormat(currentDiagram, patch) {
  // Crear una copia del diagrama actual
  let updated = { ...currentDiagram };
  
  // Asegurarnos de que el diagrama tenga arrays de clases y relaciones
  updated.classes = updated.classes || [];
  updated.relations = updated.relations || [];
  
  // Procesar las clases que vienen en el patch
  if (patch.classes && Array.isArray(patch.classes)) {
    for (const newClass of patch.classes) {
      // Buscar si la clase ya existe en el diagrama
      const existingIndex = updated.classes.findIndex(c => c.id === newClass.id);
      
      if (existingIndex >= 0) {
        // Si existe, actualizar sus datos
        updated.classes[existingIndex] = { ...updated.classes[existingIndex], ...newClass };
      } else {
        // Si no existe, agregarla al diagrama
        updated.classes.push(newClass);
      }
    }
  }
  
  // Procesar las relaciones que vienen en el patch
  if (patch.relations && Array.isArray(patch.relations)) {
    for (const newRelation of patch.relations) {
      // Buscar si la relación ya existe en el diagrama
      const existingIndex = updated.relations.findIndex(r => r.id === newRelation.id);
      
      if (existingIndex >= 0) {
        // Si existe, actualizar sus datos
        updated.relations[existingIndex] = { ...updated.relations[existingIndex], ...newRelation };
      } else {
        // Si no existe, agregarla al diagrama
        updated.relations.push(newRelation);
      }
    }
  }
  
  return updated;
}

// Función para ejecutar acciones (actualmente no se usa)
async function execute(req, res) {
  try {
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error en execute:', err);
    return res.status(500).json({ error: 'execute_failed' });
  }
}

module.exports = { analyze, execute, chatWithDiagram };
