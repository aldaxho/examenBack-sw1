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

  // Diagnostic: length of incoming text
  if (AGENT_DEBUG) {
    try {
      console.log('extractFirstJson: incoming text length:', String(text).length);
    } catch (e) {}
  }

  // 1) If there's a fenced code block with json, prefer that content
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : text;

  // 2) Try direct parse of the whole candidate first (avoid truncation)
  try {
    return JSON.parse(candidate);
  } catch (e) {
    // continue to attempt finding a balanced JSON object inside the candidate
  }

  // 3) Find the first balanced JSON object using a simple stack (avoids naive lastIndexOf issues)
  const str = String(candidate);
  let start = -1;
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '{') {
      if (start === -1) start = i;
      depth++;
    } else if (ch === '}') {
      if (depth > 0) depth--;
      if (depth === 0 && start !== -1) {
        const slice = str.slice(start, i + 1);
        try {
          return JSON.parse(slice);
        } catch (e) {
          // if parsing fails, continue searching for next balanced block
          start = -1;
        }
      }
    }
  }

  // 4) As a last resort, try a regex to grab a large {...} block
  const regexMatch = str.match(/\{[\s\S]{100,}\}/);
  if (regexMatch) {
    try { return JSON.parse(regexMatch[0]); } catch (e) {}
  }

  // Failed to find parsable JSON
  if (AGENT_DEBUG) console.warn('extractFirstJson: no JSON found in text (preview):', String(candidate).slice(0, 1000));
  return null;
}

// Función para transformar formato antiguo (patch array) al nuevo formato (classes/relations)
function transformPatchToNewFormat(parsed) {
  if (!parsed?.proposal?.patch) return parsed;

  // Diagnostic: log input patch format
  const inputPatch = parsed.proposal.patch;
  if (AGENT_DEBUG) {
    try {
      const isArray = Array.isArray(inputPatch);
      const isNewFormat = inputPatch.classes !== undefined || inputPatch.relations !== undefined;
      console.log('transformPatchToNewFormat: input is array?', isArray, '| has classes/relations?', isNewFormat);
    } catch(e){}
  }

  // Si ya está en el nuevo formato CON ARRAYS VÁLIDOS, devolverlo tal como está
  if (!Array.isArray(inputPatch) && typeof inputPatch === 'object') {
    // Ensure classes and relations exist and are arrays
    const classes = Array.isArray(inputPatch.classes) ? inputPatch.classes : [];
    const relations = Array.isArray(inputPatch.relations) ? inputPatch.relations : [];

    // If it has both arrays (even if empty), it's already in the right format
    if (inputPatch.classes !== undefined || inputPatch.relations !== undefined) {
      if (AGENT_DEBUG) {
        console.log('transformPatchToNewFormat: already in new format. classes:', classes.length, 'relations:', relations.length);
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
  }

  // Si es un array (formato antiguo), transformarlo
  if (Array.isArray(inputPatch)) {
    const classes = [];
    const relations = [];

    for (const operation of inputPatch) {
      // Some agents send `op` instead of `type`, and use names like 'update_class'
      const opType = operation.type || operation.op || '';
      // Normalize various op names to cover common variants
      const normalized = opType.toString().toLowerCase();
      switch (normalized) {
        case 'add_class':
        case 'modify_class':
        case 'update_class':
          if (operation.data) {
            // Ensure the item has an id field
            const item = { ...(operation.data || {}) };
            if (!item.id && operation.id) item.id = operation.id;
            classes.push(item);
          }
          break;
        case 'add_relation':
        case 'modify_relation':
        case 'update_relation':
          if (operation.data) {
            const item = { ...(operation.data || {}) };
            if (!item.id && operation.id) item.id = operation.id;
            relations.push(item);
          }
          break;
        default:
          // Fallback: if the operation object looks like a class or relation, include it
          if (operation && typeof operation === 'object') {
            if (operation.name && (operation.attributes || operation.methods)) {
              // treat as class
              const item = { ...(operation || {}) };
              if (!item.id && operation.id) item.id = operation.id;
              classes.push(item);
            } else if (operation.source && operation.target) {
              const item = { ...(operation || {}) };
              if (!item.id && operation.id) item.id = operation.id;
              relations.push(item);
            } else if (operation.data && operation.data.name) {
              const item = { ...(operation.data || {}) };
              if (!item.id && operation.id) item.id = operation.id;
              classes.push(item);
            }
          }
      }
    }

    if (AGENT_DEBUG) {
      console.log('transformPatchToNewFormat: converted array format. classes:', classes.length, 'relations:', relations.length);
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
  // 1) Try to parse the entire text directly (fast-path)
  if (!text) return { analysis: { summary: '', intent }, proposal: { patch: { classes: [], relations: [] } } };
  try {
    const direct = JSON.parse(text);
    if (direct && (direct.analysis || direct.proposal)) {
      const normalized = transformPatchToNewFormat(direct);
      if (AGENT_DEBUG) {
        try {
          console.log('coerceAgentObjectFromText: parsed direct JSON. classes:', (normalized.proposal?.patch?.classes||[]).length, 'relations:', (normalized.proposal?.patch?.relations||[]).length);
        } catch(e){}
      }
      return normalized;
    }
  } catch (e) {
    // not direct JSON; continue to extraction
  }

  // 2) Try to extract a JSON object from the text
  const parsed = extractFirstJson(text);
  if (parsed && (parsed.analysis || parsed.proposal)) {
    const norm = transformPatchToNewFormat(parsed);
    if (AGENT_DEBUG) {
      try {
        console.log('coerceAgentObjectFromText: extracted JSON. classes:', (norm.proposal?.patch?.classes||[]).length, 'relations:', (norm.proposal?.patch?.relations||[]).length);
      } catch(e){}
    }
    return norm;
  }

  // 3) Fallback: ensure we always return a properly structured object
  // even if parsing failed - never return with empty/undefined patch
  const fallbackObject = {
    analysis: {
      summary: (text || '').slice(0, 4000),
      intent
    },
    proposal: {
      patch: {
        classes: [],
        relations: []
      }
    }
  };

  if (AGENT_DEBUG) {
    console.warn('coerceAgentObjectFromText: falling back — could not parse JSON. Raw text length:', String(text).length);
    try { console.warn('coerceAgentObjectFromText: preview start:', String(text).slice(0, 2000)); } catch(e){}
    try { console.warn('coerceAgentObjectFromText: preview end:', String(text).slice(-1000)); } catch(e){}
  }

  return fallbackObject;
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
          // Diagnostic log: show a trimmed preview of the contentString and lengths so we can see why parsing might fail
          if (AGENT_DEBUG) {
            try {
              console.log('agent contentString length:', String(contentString).length);
              console.log('agent contentString preview start:', String(contentString).slice(0, 2000));
              console.log('agent contentString preview end:', String(contentString).slice(-500));
            } catch(e){}
          }
          const obj = coerceAgentObjectFromText(contentString, { intent });
          if (AGENT_DEBUG) console.log('agent coerce result (obj):', obj && typeof obj === 'object' ? Object.keys(obj) : typeof obj);
          if (obj?.analysis || obj?.proposal) {
            console.log('Normalizado a objeto de agente (analysis/proposal).');
            return obj;
          }
          // Ultra fallback: return minimal object but also log so we can detect frequent fallbacks
          if (AGENT_DEBUG) console.warn('callAgent: using ultra fallback (no analysis/proposal parsed). Returning summary-only object.');
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
