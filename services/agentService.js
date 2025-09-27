// services/agentService.js
const AGENT_URL = (process.env.AGENT_URL || '').replace(/\/+$/, '');
const AGENT_TOKEN = (process.env.AGENT_TOKEN || '').trim();
const AGENT_MODEL = process.env.AGENT_MODEL || 'gpt-4o-mini';
const AGENT_EXTRA_ENDPOINT = process.env.AGENT_EXTRA_ENDPOINT || ''; // e.g. /api/generate
const AGENT_DEBUG = (process.env.AGENT_DEBUG || 'false').toLowerCase() === 'true';
const AGENT_MODE = (process.env.AGENT_MODE || 'auto').toLowerCase(); // auto|chat|responses|raw
const AGENT_MOCK = (process.env.AGENT_MOCK || 'true').toLowerCase() === 'true';

// ---------- Helpers de payload ----------
function buildUserPayload({ diagram, intent, user_message }) {
  return JSON.stringify({
    diagram: diagram ?? { titulo: 'Sin título', classes: [], relations: [] },
    intent: intent || 'free_chat',
    user_message: user_message || ''
  });
}

function buildSystemPrompt() {
  // Fuerza JSON con el esquema esperado por el frontend
  return [
    'Eres un agente experto en diagramas UML y bases de datos.',
    'DEVUELVE EXCLUSIVAMENTE un JSON con este esquema, sin texto extra ni bloques Markdown:',
    '{',
    '  "analysis": { "summary": "string", "intent": "string?" },',
    '  "proposal": {',
    '    "patch": {',
    '      "classes": [',
    '        { "id": "string", "name": "string", "x": number, "y": number, "attributes": string[], "methods": string[] }',
    '      ],',
    '      "relations": [',
    '        { "id": "string", "type": "Asociación|Composición|Agregación|Generalización", "source": "classId", "target": "classId", "multiplicidadOrigen": "string", "multiplicidadDestino": "string" }',
    '      ]',
    '    }',
    '  }',
    '}',
    'Reglas:',
    '- Ubica x/y con valores numéricos razonables (ej: x: 100, y: 100).',
    '- Usa ids únicos (p.ej. "class-<timestamp>" / "rel-<timestamp>").',
    '- Incluye atributos con PK/FK cuando corresponda (ej: "id (PK)", "customer_id (FK)").',
    '- No envíes texto fuera del JSON.'
  ].join('\n');
}

function authHeaderVariants() {
  return [
    { 'Authorization': `Bearer ${AGENT_TOKEN}` },
    { 'X-API-Key': AGENT_TOKEN },
  ];
}

// ---------- Helpers de parsing/normalización ----------
function extractFirstJson(text) {
  if (!text) return null;

  // 1) bloque ```json ... ```
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const blob = fence ? fence[1].trim() : text.trim();

  // 2) intenta recortar primer {...} balanceado
  const first = blob.indexOf('{');
  const last = blob.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const slice = blob.slice(first, last + 1);
    try { return JSON.parse(slice); } catch {}
  }

  // 3) intento directo
  try { return JSON.parse(blob); } catch {}
  return null;
}

// Función para transformar formato antiguo (patch array) al nuevo formato (classes/relations)
function transformPatchToNewFormat(parsed) {
  if (!parsed?.proposal?.patch) return parsed;
  
  // Si ya está en el nuevo formato, devolverlo tal como está
  if (parsed.proposal.patch.classes && parsed.proposal.patch.relations) {
    return parsed;
  }
  
  // Si es un array (formato antiguo), transformarlo
  if (Array.isArray(parsed.proposal.patch)) {
    const classes = [];
    const relations = [];
    
    for (const operation of parsed.proposal.patch) {
      switch (operation.type) {
        case 'add_class':
        case 'modify_class':
          if (operation.data) {
            classes.push(operation.data);
          }
          break;
        case 'add_relation':
        case 'modify_relation':
          if (operation.data) {
            relations.push(operation.data);
          }
          break;
      }
    }
    
    return {
      ...parsed,
      proposal: {
        patch: {
          classes,
          relations
        }
      }
    };
  }
  
  return parsed;
}

function coerceAgentObjectFromText(text, { intent } = {}) {
  const parsed = extractFirstJson(text);
  if (parsed && (parsed.analysis || parsed.proposal)) {
    return transformPatchToNewFormat(parsed);
  }

  // Fallback mínimo utilizable para el controller/frontend
  return {
    analysis: { summary: (text || '').slice(0, 4000), intent },
    proposal: { patch: { classes: [], relations: [] } }
  };
}

// ---------- Construcción de bodies ----------
function buildBodies(messages) {
  const list = [
    // 1) DigitalOcean Agents endpoint
    {
      kind: 'chat',
      urlSuffix: '/api/v1/chat/completions',
      body: {
        messages,
        stream: false,
        include_functions_info: false,
        include_retrieval_info: false,
        include_guardrails_info: false
      }
    },
    // 2) Fallback OpenAI estándar
    {
      kind: 'chat',
      urlSuffix: '/v1/chat/completions',
      body: {
        model: AGENT_MODEL,
        temperature: 0,
        messages,
        // Donde se soporte, forzar JSON
        response_format: { type: 'json_object' }
      }
    },
    // 3) Fallback sin /v1
    {
      kind: 'chat',
      urlSuffix: '/chat/completions',
      body: {
        model: AGENT_MODEL,
        temperature: 0,
        messages
      }
    }
  ];

  if (AGENT_EXTRA_ENDPOINT) {
    list.unshift({
      kind: 'raw',
      urlSuffix: AGENT_EXTRA_ENDPOINT.startsWith('/') ? AGENT_EXTRA_ENDPOINT : `/${AGENT_EXTRA_ENDPOINT}`,
      body: { payload: messages } // enviamos mensajes también en el extra endpoint
    });
  }

  if (AGENT_MODE !== 'auto') {
    return list.filter(b => {
      if (AGENT_MODE === 'chat') return b.kind === 'chat';
      if (AGENT_MODE === 'responses') return b.kind === 'responses';
      if (AGENT_MODE === 'raw') return b.kind === 'raw';
      return true;
    });
  }
  return list;
}

// ---------- Extracción de contenido por tipo ----------
function extractAnswer(kind, data) {
  if (kind === 'chat') {
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return {};
    // si parece JSON, intentaremos más adelante; devolvemos contentString
    return { contentString: content };
  }
  if (kind === 'responses') {
    const output = data?.output_text;
    if (Array.isArray(output)) return { contentString: output.join('\n') };
    return { contentString: output };
  }
  if (kind === 'raw') {
    return { object: data };
  }
  return {};
}

async function tryOne(url, headers, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return res;
}

// ---------- Llamada principal ----------
async function callAgent({ diagram, intent = 'free_chat', user_message = '', forceMock = false }) {
  if (AGENT_MOCK || forceMock) {
    console.log('Usando respuesta mock del agente (AGENT_MOCK=true)');
    const timestamp = Date.now();
    const customerId = 'class-' + timestamp;
    const orderId = 'class-' + (timestamp + 1);
    const relationId = 'rel-' + timestamp;
    
    return {
      analysis: {
        summary: 'Se ha convertido el diagrama a un e-commerce con Customer y Order',
        intent: intent || 'convertir',
        classes_detected: diagram?.classes?.length || 0,
        user_request: user_message
      },
      proposal: {
        patch: {
          classes: [
            {
              id: customerId,
              name: 'Customer',
              x: 100,
              y: 100,
              attributes: ['id (PK)', 'name', 'email', 'address'],
              methods: []
            },
            {
              id: orderId,
              name: 'Order',
              x: 300,
              y: 100,
              attributes: ['id (PK)', 'order_date', 'status', 'customer_id (FK)'],
              methods: []
            }
          ],
          relations: [
            {
              id: relationId,
              type: 'Asociación',
              source: customerId,
              target: orderId,
              multiplicidadOrigen: '1..*',
              multiplicidadDestino: '1'
            }
          ]
        },
        note: 'Configura AGENT_MOCK=false y variables AGENT_URL/AGENT_TOKEN para usar el agente real.'
      }
    };
  }

  if (!AGENT_URL || !AGENT_TOKEN) {
    console.log('AGENT_URL/AGENT_TOKEN no configurados. Usando modo mock automáticamente.');
    return {
      analysis: {
        summary: 'Modo mock activado - configura AGENT_URL y AGENT_TOKEN para usar el agente real',
        intent: intent || 'mock',
        classes_detected: diagram?.classes?.length || 0,
        user_request: user_message
      },
      proposal: {
        patch: {
          classes: [],
          relations: []
        },
        note: 'Configura AGENT_URL y AGENT_TOKEN en variables de entorno para usar el agente real.'
      }
    };
  }

  console.log('Llamando agente en:', AGENT_URL);

  const userContent = buildUserPayload({ diagram, intent, user_message });
  const systemPrompt = buildSystemPrompt();
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  const bodies = buildBodies(messages);
  const auths = authHeaderVariants();

  let lastErrText = '';
  const errorAttempts = [];

  for (const b of bodies) {
    for (const auth of auths) {
      const url = `${AGENT_URL}${b.urlSuffix}`;
      try {
        const res = await tryOne(url, auth, b.body);
        const txt = await res.text();
        if (!res.ok) {
          lastErrText = `(${res.status}) ${url} :: ${txt}`;
          errorAttempts.push(lastErrText);
          console.log(`Falló ${url}: ${res.status} - ${txt.slice(0, 200)}`);
          continue;
        }

        console.log(`Éxito ${url}: ${res.status}`);
        let data = {};
        try { data = JSON.parse(txt); } catch {}
        const { contentString, object } = extractAnswer(b.kind, data);

        if (contentString) {
          const obj = coerceAgentObjectFromText(contentString, { intent });
          if (obj?.analysis || obj?.proposal) {
            console.log('Normalizado a objeto de agente (analysis/proposal).');
            return obj;
          }
          // Ultra fallback
          return { analysis: { summary: contentString, intent }, proposal: { patch: { classes: [], relations: [] } } };
        }

        if (object) {
          console.log('Respuesta ya es objeto');
          return object;
        }

        console.log('Usando respuesta directa de la API (sin content)');
        return data;

      } catch (e) {
        lastErrText = `${url} :: ${e.message}`;
        errorAttempts.push(lastErrText);
        continue;
      }
    }
  }

  const baseMsg = `No se pudo invocar al agente. Último error: ${lastErrText}`;
  if (AGENT_DEBUG) {
    throw new Error(baseMsg + ` | intentos: ${errorAttempts.join(' | ')}`);
  }
  throw new Error(baseMsg);
}

module.exports = { callAgent };
