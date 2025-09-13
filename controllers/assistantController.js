// controllers/assistantController.js
const { callAgent } = require('../services/agentService');
const { Diagrama, DiagramaUsuario } = require('../models');

async function analyze(req, res) {
  try {
    let { diagram, intent, user_message, diagramId } = req.body || {};
    const forceMock = (req.query.forceMock === 'true');

    // Si se proporciona diagramId y no se envía diagrama explícito, cargarlo
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

    // Soporta llamadas sin diagrama (para creación)
    const baseDiagram = diagram ?? { titulo: 'Sin título', classes: [], relations: [] };

    if ((!baseDiagram.titulo || baseDiagram.titulo === 'Sin título') && user_message) {
      baseDiagram.titulo = user_message.slice(0, 80);
    }

    const data = await callAgent({ diagram: baseDiagram, intent: intent || 'free_chat', user_message: user_message || '', forceMock });

    if (!data || !data.analysis) {
      console.error('Invalid agent response shape:', data);
      return res.status(502).json({ error: 'invalid_agent_response', data });
    }
    return res.json({ ...data, diagramId: diagramId || null });
  } catch (err) {
    console.error('assistant/analyze error:', err);
    return res.status(500).json({ error: 'assistant_failed', detail: err.message });
  }
}

// Chat contextual con diagrama específico + tiempo real
async function chatWithDiagram(req, res) {
  try {
    const { diagramId } = req.params;
    const { user_message, intent = 'chat' } = req.body;
    const userId = req.user.id;

    if (!diagramId || !user_message) {
      return res.status(400).json({ error: 'diagramId y user_message requeridos' });
    }

    // Cargar diagrama actual
    const diagrama = await Diagrama.findByPk(diagramId);
    if (!diagrama) {
      return res.status(404).json({ error: 'Diagrama no encontrado' });
    }

    // Verificar permisos (propietario o colaborador)
    const tieneAcceso = diagrama.usuarioId === userId || 
      await DiagramaUsuario.findOne({
        where: { diagramaId, usuarioId, estado: 'aceptado' }
      });

    if (!tieneAcceso) {
      return res.status(403).json({ error: 'Sin acceso al diagrama' });
    }

    // Llamar al agente con contexto del diagrama
    const data = await callAgent({
      diagram: diagrama.contenido,
      intent,
      user_message
    });

    // Si el agente propone cambios, aplicarlos en tiempo real vía Socket.IO
    if (data.proposal && data.proposal.patch && (data.proposal.patch.classes || data.proposal.patch.relations)) {
      const { patch } = data.proposal;
      
      // Aplicar patch al diagrama
      const updatedContent = applyPatchNewFormat(diagrama.contenido, patch);
      
      // Guardar en BD
      await diagrama.update({ contenido: updatedContent });
      
      // Emitir cambios en tiempo real a todos los usuarios en la sala
      req.app.get('io').to(diagramId).emit('agent-update', {
        type: 'diagram_modified',
        patch,
        updatedDiagram: updatedContent,
        message: data.messages?.[0] || 'Diagrama actualizado por el asistente',
        timestamp: new Date()
      });
    }

    return res.json({
      ...data,
      diagramId,
      applied: !!(data.proposal?.patch?.classes?.length || data.proposal?.patch?.relations?.length)
    });

  } catch (err) {
    console.error('assistant/chatWithDiagram error:', err);
    return res.status(500).json({ error: 'chat_failed', detail: err.message });
  }
}

// Aplicar patch al diagrama (implementación básica)
function applyPatch(currentDiagram, patch) {
  let updated = { ...currentDiagram };
  
  for (const operation of patch) {
    switch (operation.type) {
      case 'add_class':
        updated.classes = updated.classes || [];
        updated.classes.push(operation.data);
        break;
      case 'modify_class':
        const classIndex = updated.classes?.findIndex(c => c.id === operation.id);
        if (classIndex >= 0) {
          updated.classes[classIndex] = { ...updated.classes[classIndex], ...operation.data };
        }
        break;
      case 'remove_class':
        updated.classes = updated.classes?.filter(c => c.id !== operation.id) || [];
        break;
      case 'add_relation':
        updated.relations = updated.relations || [];
        updated.relations.push(operation.data);
        break;
      case 'modify_relation':
        const relIndex = updated.relations?.findIndex(r => r.id === operation.id);
        if (relIndex >= 0) {
          updated.relations[relIndex] = { ...updated.relations[relIndex], ...operation.data };
        }
        break;
      case 'remove_relation':
        updated.relations = updated.relations?.filter(r => r.id !== operation.id) || [];
        break;
      default:
        console.warn('Tipo de patch no reconocido:', operation.type);
    }
  }
  
  return updated;
}

// Aplicar patch al diagrama (nuevo formato con classes y relations directamente)
function applyPatchNewFormat(currentDiagram, patch) {
  let updated = { ...currentDiagram };
  
  // Asegurar que tenemos arrays para classes y relations
  updated.classes = updated.classes || [];
  updated.relations = updated.relations || [];
  
  // Agregar nuevas clases
  if (patch.classes && Array.isArray(patch.classes)) {
    for (const newClass of patch.classes) {
      // Verificar si la clase ya existe
      const existingIndex = updated.classes.findIndex(c => c.id === newClass.id);
      if (existingIndex >= 0) {
        // Actualizar clase existente
        updated.classes[existingIndex] = { ...updated.classes[existingIndex], ...newClass };
      } else {
        // Agregar nueva clase
        updated.classes.push(newClass);
      }
    }
  }
  
  // Agregar nuevas relaciones
  if (patch.relations && Array.isArray(patch.relations)) {
    for (const newRelation of patch.relations) {
      // Verificar si la relación ya existe
      const existingIndex = updated.relations.findIndex(r => r.id === newRelation.id);
      if (existingIndex >= 0) {
        // Actualizar relación existente
        updated.relations[existingIndex] = { ...updated.relations[existingIndex], ...newRelation };
      } else {
        // Agregar nueva relación
        updated.relations.push(newRelation);
      }
    }
  }
  
  return updated;
}

async function execute(req, res) {
  try {
    // opcional: guarda en DB {diagram, patch, userId, timestamp}
    return res.json({ ok: true });
  } catch (err) {
    console.error('assistant/execute error:', err);
    return res.status(500).json({ error: 'execute_failed' });
  }
}

module.exports = { analyze, execute, chatWithDiagram };
