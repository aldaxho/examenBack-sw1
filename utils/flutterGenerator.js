const fs = require('fs').promises;
const path = require('path');
const { createHomeScreen } = require('./createHomeScreen');

// Función para generar proyecto Flutter completo con conexión al backend
async function generateFlutterProject(diagramaJSON, titulo, backendPort = 8080) {
  // Validación de entrada
  if (!diagramaJSON || typeof diagramaJSON !== 'object') {
    throw new Error('diagramaJSON es requerido y debe ser un objeto válido');
  }
  
  if (backendPort && (typeof backendPort !== 'number' || backendPort < 1 || backendPort > 65535)) {
    throw new Error('backendPort debe ser un número válido entre 1 y 65535');
  }
  
  console.log('📱 Generando proyecto Flutter completo...');
  
  const cleanTitulo = titulo && typeof titulo === 'string' 
    ? titulo.replace(/[^\w\s]/g, '').trim() 
    : 'SistemaEmpresarial';
  
  // Crear directorio temporal
  const timestamp = Date.now();
  const projectName = `flutter-frontend-${timestamp}`;
  const baseDir = path.join(__dirname, '../temp');
  const projectDir = path.join(baseDir, projectName);
  
  await fs.mkdir(projectDir, { recursive: true });
  
  // Crear estructura de directorios Flutter
  const libDir = path.join(projectDir, 'lib');
  const androidDir = path.join(projectDir, 'android');
  const iosDir = path.join(projectDir, 'ios');
  const webDir = path.join(projectDir, 'web');
  const testDir = path.join(projectDir, 'test');
  
  // Directorios principales
  await fs.mkdir(libDir, { recursive: true });
  await fs.mkdir(androidDir, { recursive: true });
  await fs.mkdir(iosDir, { recursive: true });
  await fs.mkdir(webDir, { recursive: true });
  await fs.mkdir(testDir, { recursive: true });
  
  // Subdirectorios para arquitectura Flutter
  const modelsDir = path.join(libDir, 'models');
  const servicesDir = path.join(libDir, 'services');
  const screensDir = path.join(libDir, 'screens');
  const widgetsDir = path.join(libDir, 'widgets');
  const configDir = path.join(libDir, 'config');
  const utilsDir = path.join(libDir, 'utils');
  
  await fs.mkdir(modelsDir, { recursive: true });
  await fs.mkdir(servicesDir, { recursive: true });
  await fs.mkdir(screensDir, { recursive: true });
  await fs.mkdir(widgetsDir, { recursive: true });
  await fs.mkdir(configDir, { recursive: true });
  await fs.mkdir(utilsDir, { recursive: true });
  
  // Analizar y procesar entidades
  const entities = [];
  const entityMap = new Map();
  const relations = diagramaJSON.relations || [];
  
  // Procesar clases y crear mapeo
  if (diagramaJSON.classes) {
    for (const clase of diagramaJSON.classes) {
      const entityName = cleanClassName(clase.name) || `Entity${entities.length + 1}`;
      entities.push(entityName);
      entityMap.set(clase.id, { ...clase, entityName });
    }
    
    // Generar todas las clases
    const errors = [];
    for (const clase of diagramaJSON.classes) {
      try {
        const entityName = entityMap.get(clase.id)?.entityName;
        
        if (!entityName) {
          console.warn(`⚠️ No se encontró entityName para clase ID: ${clase.id}`);
          continue;
        }
        
        // Crear modelo Dart
        await createDartModel(modelsDir, entityName, clase);
        
        // Crear servicio API
        await createApiService(servicesDir, entityName, clase);
        
        // Crear pantallas de gestión
        await createManagementScreens(screensDir, entityName, clase);
        
        console.log(`✅ Entidad ${entityName} generada correctamente`);
      } catch (error) {
        console.error(`❌ Error generando entidad ${clase.name}:`, error);
        errors.push({ clase: clase.name || 'Desconocida', error: error.message });
      }
    }
    
    if (errors.length > 0) {
      console.warn(`⚠️ Se generaron ${entities.length - errors.length} de ${entities.length} entidades`);
      console.warn('Errores encontrados:', errors);
    }
  }
  
  // Crear archivos principales
  await createMainDart(libDir, entities);
  await createHomeScreen(screensDir, entities);
  await createPubspecYaml(projectDir, cleanTitulo);
  await createApiConfig(configDir, backendPort);
  await createAppTheme(configDir);
  await createNavigationService(servicesDir);
  await createHttpService(servicesDir);
  
  // Crear configuración de plataformas
  await createAndroidConfig(androidDir, cleanTitulo);
  await createIOSConfig(iosDir, cleanTitulo);
  await createWebConfig(webDir, cleanTitulo);
  
  // Crear tests
  await createTests(testDir, entities);
  
  // Crear README
  await createFlutterReadme(projectDir, cleanTitulo, entities, backendPort);
  
  // Crear scripts de ayuda
  await createSetupScripts(projectDir);
  
  console.log(`📱 Proyecto Flutter generado: ${projectName}`);
  console.log(`📍 Ubicación: ${projectDir}`);
  console.log(`🔗 Conectado al backend en puerto: ${backendPort}`);
  
  return {
    success: true,
    projectPath: projectDir,
    projectName: projectName,
    entities: entities
  };
}

// Función para limpiar nombres de clases
function cleanClassName(name) {
  if (!name) return 'Entity';
  return name.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]/, 'E$&');
}

// Función para parsear atributos
function parseAttribute(attr) {
  if (typeof attr === 'string') {
    const isPrimaryKey = attr.includes('(PK)');
    let cleanAttr = attr.replace(/\s*\(PK\)/, '');
    const parts = cleanAttr.split(':');
    const name = parts[0].trim();
    const type = parts[1] ? parts[1].trim() : 'String';
    return { name, type, isPrimaryKey };
  } else if (typeof attr === 'object') {
    const name = attr.name || 'field';
    const type = attr.type || 'String';
    const isPrimaryKey = attr.isPrimaryKey || (name.toLowerCase().includes('id') && 
                        (name.toLowerCase() === 'id' || name.toLowerCase().endsWith('id')));
    return { name, type, isPrimaryKey };
  }
  return { name: 'field', type: 'String', isPrimaryKey: false };
}

// Función para mapear tipos Dart
function mapDartType(type) {
  // Normalizar el tipo a string
  const normalizedType = String(type || '').trim();
  
  const typeMap = {
    'String': 'String',
    'string': 'String',
    'Integer': 'int',
    'int': 'int',
    'Long': 'int',
    'long': 'int',
    'BigDecimal': 'double',
    'Double': 'double',
    'double': 'double',
    'Float': 'double',
    'float': 'double',
    'Boolean': 'bool',
    'boolean': 'bool',
    'bool': 'bool',
    'LocalDate': 'DateTime',
    'LocalDateTime': 'DateTime',
    'Date': 'DateTime',
    'Timestamp': 'DateTime',
    'ZonedDateTime': 'DateTime'
  };
  
  const mappedType = typeMap[normalizedType];
  
  if (!mappedType) {
    console.warn(`⚠️ Tipo desconocido: "${type}", usando String por defecto`);
    return 'String';
  }
  
  return mappedType;
}

// Crear modelo Dart
async function createDartModel(modelsDir, entityName, clase) {
  let modelContent = `import 'package:json_annotation/json_annotation.dart';

part '${entityName.toLowerCase()}.g.dart';

@JsonSerializable()
class ${entityName} {
  final int? id;
`;

  // Agregar atributos básicos
  if (clase.attributes && Array.isArray(clase.attributes) && clase.attributes.length > 0) {
    clase.attributes.forEach(attr => {
      try {
        const { name, type, isPrimaryKey } = parseAttribute(attr);
        
        // Validación robusta
        if (!name || typeof name !== 'string') {
          console.warn(`⚠️ Atributo sin nombre válido: ${JSON.stringify(attr)}`);
          return; // Skip this attribute
        }
        
        if (!isPrimaryKey && name && 
            !name.toLowerCase().includes('id_class') && 
            !name.toLowerCase().includes('id_persona') && 
            name.toLowerCase() !== 'id' &&
            !name.toLowerCase().endsWith('_id')) {
          const dartType = mapDartType(type);
          const nullableType = dartType === 'int' || dartType === 'double' || dartType === 'bool' ? dartType : 'String?';
          modelContent += `  final ${nullableType} ${name};\n`;
        }
      } catch (error) {
        console.error(`❌ Error procesando atributo: ${JSON.stringify(attr)}`, error);
      }
    });
  }

  modelContent += `
  const ${entityName}({
    this.id,`;

  // Agregar parámetros del constructor
  if (clase.attributes && clase.attributes.length > 0) {
    clase.attributes.forEach(attr => {
      const { name, type, isPrimaryKey } = parseAttribute(attr);
      if (!isPrimaryKey && name && 
          !name.toLowerCase().includes('id_class') && 
          !name.toLowerCase().includes('id_persona') && 
          name.toLowerCase() !== 'id' &&
          !name.toLowerCase().endsWith('_id')) {
        modelContent += `\n    this.${name},`;
      }
    });
  }

  modelContent += `
  });

  factory ${entityName}.fromJson(Map<String, dynamic> json) => _$${entityName}FromJson(json);
  Map<String, dynamic> toJson() => _$${entityName}ToJson(this);

  ${entityName} copyWith({
    int? id,`;

  // Agregar copyWith parameters
  if (clase.attributes && clase.attributes.length > 0) {
    clase.attributes.forEach(attr => {
      const { name, type, isPrimaryKey } = parseAttribute(attr);
      if (!isPrimaryKey && name && 
          !name.toLowerCase().includes('id_class') && 
          !name.toLowerCase().includes('id_persona') && 
          name.toLowerCase() !== 'id' &&
          !name.toLowerCase().endsWith('_id')) {
        const dartType = mapDartType(type);
        const nullableType = dartType === 'int' || dartType === 'double' || dartType === 'bool' ? dartType : 'String?';
        modelContent += `\n    ${nullableType} ${name},`;
      }
    });
  }

  modelContent += `
  }) {
    return ${entityName}(
      id: id ?? this.id,`;

  // Agregar copyWith body
  if (clase.attributes && clase.attributes.length > 0) {
    clase.attributes.forEach(attr => {
      const { name, type, isPrimaryKey } = parseAttribute(attr);
      if (!isPrimaryKey && name && 
          !name.toLowerCase().includes('id_class') && 
          !name.toLowerCase().includes('id_persona') && 
          name.toLowerCase() !== 'id' &&
          !name.toLowerCase().endsWith('_id')) {
        modelContent += `\n      ${name}: ${name} ?? this.${name},`;
      }
    });
  }

  modelContent += `
    );
  }

  @override
  String toString() {`;

  // Generar la lista de atributos ANTES del template string
  let attributesToString = '';
  if (clase.attributes && Array.isArray(clase.attributes) && clase.attributes.length > 0) {
    const validAttributes = clase.attributes
      .map(attr => {
        try {
          const { name } = parseAttribute(attr);
          if (name && 
              !name.toLowerCase().includes('id_class') && 
              !name.toLowerCase().includes('id_persona') && 
              name.toLowerCase() !== 'id' &&
              !name.toLowerCase().endsWith('_id')) {
            return `${name}: \\$${name}`;
          }
          return null;
        } catch (error) {
          console.error(`❌ Error en toString para atributo:`, error);
          return null;
        }
      })
      .filter(Boolean);
    
    attributesToString = validAttributes.join(', ');
  }

  modelContent += `
    return '${entityName}(id: \\$id${attributesToString ? ', ' + attributesToString : ''})';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ${entityName} && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}`;

  await fs.writeFile(path.join(modelsDir, `${entityName.toLowerCase()}.dart`), modelContent);
}

// Crear servicio API
async function createApiService(servicesDir, entityName, clase) {
  const serviceContent = `import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/${entityName.toLowerCase()}.dart';
import '../config/api_config.dart';

class ${entityName}Service {
  static const String _baseUrl = ApiConfig.baseUrl;
  static const String _endpoint = '${entityName.toLowerCase()}';

  // Obtener todos los registros
  static Future<List<${entityName}>> getAll() async {
    try {
      final response = await http.get(
        Uri.parse('\$_baseUrl/\$_endpoint'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = json.decode(response.body);
        return jsonList.map((json) => ${entityName}.fromJson(json)).toList();
      } else {
        throw Exception('Error al obtener ${entityName.toLowerCase()}: \${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: \$e');
    }
  }

  // Obtener por ID
  static Future<${entityName}?> getById(int id) async {
    try {
      final response = await http.get(
        Uri.parse('\$_baseUrl/\$_endpoint/\$id'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return ${entityName}.fromJson(json.decode(response.body));
      } else if (response.statusCode == 404) {
        return null;
      } else {
        throw Exception('Error al obtener ${entityName.toLowerCase()}: \${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: \$e');
    }
  }

  // Crear nuevo registro
  static Future<${entityName}> create(${entityName} ${entityName.toLowerCase()}) async {
    try {
      final response = await http.post(
        Uri.parse('\$_baseUrl/\$_endpoint'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(${entityName.toLowerCase()}.toJson()),
      );

      if (response.statusCode == 201) {
        return ${entityName}.fromJson(json.decode(response.body));
      } else {
        throw Exception('Error al crear ${entityName.toLowerCase()}: \${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: \$e');
    }
  }

  // Actualizar registro
  static Future<${entityName}> update(int id, ${entityName} ${entityName.toLowerCase()}) async {
    try {
      final response = await http.put(
        Uri.parse('\$_baseUrl/\$_endpoint/\$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(${entityName.toLowerCase()}.toJson()),
      );

      if (response.statusCode == 200) {
        return ${entityName}.fromJson(json.decode(response.body));
      } else {
        throw Exception('Error al actualizar ${entityName.toLowerCase()}: \${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: \$e');
    }
  }

  // Actualización parcial
  static Future<${entityName}> partialUpdate(int id, Map<String, dynamic> updates) async {
    try {
      final response = await http.patch(
        Uri.parse('\$_baseUrl/\$_endpoint/\$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(updates),
      );

      if (response.statusCode == 200) {
        return ${entityName}.fromJson(json.decode(response.body));
      } else {
        throw Exception('Error al actualizar ${entityName.toLowerCase()}: \${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: \$e');
    }
  }

  // Eliminar registro
  static Future<bool> delete(int id) async {
    try {
      final response = await http.delete(
        Uri.parse('\$_baseUrl/\$_endpoint/\$id'),
        headers: {'Content-Type': 'application/json'},
      );

      return response.statusCode == 204;
    } catch (e) {
      throw Exception('Error de conexión: \$e');
    }
  }

  // Contar registros
  static Future<int> count() async {
    try {
      final response = await http.get(
        Uri.parse('\$_baseUrl/\$_endpoint/count'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Error al contar ${entityName.toLowerCase()}: \${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: \$e');
    }
  }
}`;

  await fs.writeFile(path.join(servicesDir, `${entityName.toLowerCase()}_service.dart`), serviceContent);
}

// Crear pantallas de gestión
async function createManagementScreens(screensDir, entityName, clase) {
  // Pantalla de lista
  const listScreenContent = `import 'package:flutter/material.dart';
import '../models/${entityName.toLowerCase()}.dart';
import '../services/${entityName.toLowerCase()}_service.dart';
import '${entityName.toLowerCase()}_detail_screen.dart';
import '${entityName.toLowerCase()}_form_screen.dart';

class ${entityName}ListScreen extends StatefulWidget {
  const ${entityName}ListScreen({Key? key}) : super(key: key);

  @override
  State<${entityName}ListScreen> createState() => _${entityName}ListScreenState();
}

class _${entityName}ListScreenState extends State<${entityName}ListScreen> {
  List<${entityName}> _items = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadItems();
  }

  Future<void> _loadItems() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final items = await ${entityName}Service.getAll();
      setState(() {
        _items = items;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteItem(${entityName} item) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar eliminación'),
        content: Text('¿Estás seguro de que quieres eliminar este ${entityName.toLowerCase()}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ${entityName}Service.delete(item.id!);
        _loadItems();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('${entityName} eliminado correctamente')),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al eliminar: \$e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${entityName}'),
        centerTitle: true,
        backgroundColor: Colors.black,
        elevation: 2,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadItems,
          ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const ${entityName}FormScreen(),
            ),
          );
          if (result == true) {
            _loadItems();
          }
        },
        child: const Icon(Icons.add),
        backgroundColor: Theme.of(context).colorScheme.primary,
        tooltip: 'Agregar ${entityName}',
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text('Error: \$_error', textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadItems,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }

    if (_items.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No hay ${entityName.toLowerCase()} registrados'),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadItems,
      child: ListView.builder(
        itemCount: _items.length,
        itemBuilder: (context, index) {
          final item = _items[index];
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
            child: InkWell(
              onTap: () => Navigator.push(
                context,
                PageRouteBuilder(
                  pageBuilder: (_, __, ___) => ${entityName}DetailScreen(item: item),
                  transitionsBuilder: (context, animation, secondaryAnimation, child) {
                    return FadeTransition(opacity: animation, child: child);
                  },
                ),
              ),
              borderRadius: BorderRadius.circular(14),
              child: Card(
                color: Theme.of(context).cardColor,
                elevation: 4,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        child: Text(
                          item.toString().isNotEmpty ? item.toString()[0].toUpperCase() : '?',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 18),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.toString(),
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(Icons.tag, size: 14, color: Colors.grey),
                                const SizedBox(width: 6),
                                Text('ID: \${item.id}', style: const TextStyle(fontSize: 13, color: Colors.grey)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      PopupMenuButton(
                        onSelected: (value) {
                          switch (value) {
                            case 'view':
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ${entityName}DetailScreen(item: item),
                                ),
                              );
                              break;
                            case 'edit':
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ${entityName}FormScreen(item: item),
                                ),
                              ).then((result) {
                                if (result == true) _loadItems();
                              });
                              break;
                            case 'delete':
                              _deleteItem(item);
                              break;
                          }
                        },
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: 'view',
                            child: Row(
                              children: [
                                Icon(Icons.visibility),
                                SizedBox(width: 8),
                                Text('Ver'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'edit',
                            child: Row(
                              children: [
                                Icon(Icons.edit),
                                SizedBox(width: 8),
                                Text('Editar'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'delete',
                            child: Row(
                              children: [
                                Icon(Icons.delete),
                                SizedBox(width: 8),
                                Text('Eliminar'),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}`;

  await fs.writeFile(path.join(screensDir, `${entityName.toLowerCase()}_list_screen.dart`), listScreenContent);

  // Pantalla de formulario
  const formScreenContent = `import 'package:flutter/material.dart';
import '../models/${entityName.toLowerCase()}.dart';
import '../services/${entityName.toLowerCase()}_service.dart';

class ${entityName}FormScreen extends StatefulWidget {
  final ${entityName}? item;

  const ${entityName}FormScreen({Key? key, this.item}) : super(key: key);

  @override
  State<${entityName}FormScreen> createState() => _${entityName}FormScreenState();
}

class _${entityName}FormScreenState extends State<${entityName}FormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Controladores para los campos
${clase.attributes && clase.attributes.length > 0 ? 
  clase.attributes.map(attr => {
    const { name, type } = parseAttribute(attr);
    if (name && !name.toLowerCase().includes('id_class') && 
        !name.toLowerCase().includes('id_persona') && 
        name.toLowerCase() !== 'id' &&
        !name.toLowerCase().endsWith('_id')) {
      return `  final _${name}Controller = TextEditingController();`;
    }
    return null;
  }).filter(Boolean).join('\n') : ''}

  @override
  void initState() {
    super.initState();
    if (widget.item != null) {
      _loadItemData();
    }
  }

  void _loadItemData() {
    final item = widget.item!;
${clase.attributes && clase.attributes.length > 0 ? 
  clase.attributes.map(attr => {
    const { name, type } = parseAttribute(attr);
    if (name && !name.toLowerCase().includes('id_class') && 
        !name.toLowerCase().includes('id_persona') && 
        name.toLowerCase() !== 'id' &&
        !name.toLowerCase().endsWith('_id')) {
      return `    _${name}Controller.text = item.${name}?.toString() ?? '';`;
    }
    return null;
  }).filter(Boolean).join('\n') : ''}
  }

  @override
  void dispose() {
${clase.attributes && clase.attributes.length > 0 ? 
  clase.attributes.map(attr => {
    const { name } = parseAttribute(attr);
    if (name && !name.toLowerCase().includes('id_class') && 
        !name.toLowerCase().includes('id_persona') && 
        name.toLowerCase() !== 'id' &&
        !name.toLowerCase().endsWith('_id')) {
      return `    _${name}Controller.dispose();`;
    }
    return null;
  }).filter(Boolean).join('\n') : ''}
    super.dispose();
  }

  Future<void> _saveItem() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final item = ${entityName}(
        id: widget.item?.id,
${clase.attributes && clase.attributes.length > 0 ? 
  clase.attributes.map(attr => {
    const { name, type } = parseAttribute(attr);
    if (name && !name.toLowerCase().includes('id_class') && 
        !name.toLowerCase().includes('id_persona') && 
        name.toLowerCase() !== 'id' &&
        !name.toLowerCase().endsWith('_id')) {
      const dartType = mapDartType(type);
      if (dartType === 'int') {
        return `        ${name}: int.tryParse(_${name}Controller.text),`;
      } else if (dartType === 'double') {
        return `        ${name}: double.tryParse(_${name}Controller.text),`;
      } else if (dartType === 'bool') {
        return `        ${name}: _${name}Controller.text.toLowerCase() == 'true',`;
      } else {
        return `        ${name}: _${name}Controller.text.isEmpty ? null : _${name}Controller.text,`;
      }
    }
    return null;
  }).filter(Boolean).join('\n') : ''}
      );

      if (widget.item == null) {
        await ${entityName}Service.create(item);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('${entityName} creado correctamente')),
        );
      } else {
        await ${entityName}Service.update(item.id!, item);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('${entityName} actualizado correctamente')),
        );
      }

      Navigator.of(context).pop(true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: \$e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.item == null ? 'Nuevo ${entityName}' : 'Editar ${entityName}'),
        actions: [
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            TextButton(
              onPressed: _saveItem,
              child: const Text('Guardar'),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
${clase.attributes && clase.attributes.length > 0 ? 
  clase.attributes.map(attr => {
    const { name, type } = parseAttribute(attr);
    if (name && !name.toLowerCase().includes('id_class') && 
        !name.toLowerCase().includes('id_persona') && 
        name.toLowerCase() !== 'id' &&
        !name.toLowerCase().endsWith('_id')) {
      const dartType = mapDartType(type);
      const fieldName = name.charAt(0).toUpperCase() + name.slice(1);
      
      if (dartType === 'int') {
        return `            TextFormField(
              controller: _${name}Controller,
              decoration: InputDecoration(
                labelText: '${fieldName}',
                border: const OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.isEmpty) return 'Este campo es requerido';
                if (int.tryParse(value) == null) return 'Debe ser un número entero';
                return null;
              },
            ),
            const SizedBox(height: 16),`;
      } else if (dartType === 'double') {
        return `            TextFormField(
              controller: _${name}Controller,
              decoration: InputDecoration(
                labelText: '${fieldName}',
                border: const OutlineInputBorder(),
              ),
              keyboardType: TextInputType.numberWithOptions(decimal: true),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Este campo es requerido';
                if (double.tryParse(value) == null) return 'Debe ser un número';
                return null;
              },
            ),
            const SizedBox(height: 16),`;
      } else if (dartType === 'bool') {
        return `            SwitchListTile(
              title: Text('${fieldName}'),
              value: _${name}Controller.text.toLowerCase() == 'true',
              onChanged: (value) {
                setState(() {
                  _${name}Controller.text = value.toString();
                });
              },
            ),
            const SizedBox(height: 16),`;
      } else {
        return `            TextFormField(
              controller: _${name}Controller,
              decoration: InputDecoration(
                labelText: '${fieldName}',
                border: const OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Este campo es requerido';
                return null;
              },
            ),
            const SizedBox(height: 16),`;
      }
    }
    return null;
  }).filter(Boolean).join('\n') : ''}
          ],
        ),
      ),
    );
  }
}`;

  await fs.writeFile(path.join(screensDir, `${entityName.toLowerCase()}_form_screen.dart`), formScreenContent);

  // Pantalla de detalle
  const detailScreenContent = `import 'package:flutter/material.dart';
import '../models/${entityName.toLowerCase()}.dart';
import '${entityName.toLowerCase()}_form_screen.dart';

class ${entityName}DetailScreen extends StatelessWidget {
  final ${entityName} item;

  const ${entityName}DetailScreen({Key? key, required this.item}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Detalle de ${entityName}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ${entityName}FormScreen(item: item),
                ),
              );
              if (result == true) {
                Navigator.of(context).pop(true);
              }
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Información de ${entityName}',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 16),
                    _buildDetailRow('ID', item.id?.toString() ?? 'N/A'),
${clase.attributes && clase.attributes.length > 0 ? 
  clase.attributes.map(attr => {
    const { name } = parseAttribute(attr);
    if (name && !name.toLowerCase().includes('id_class') && 
        !name.toLowerCase().includes('id_persona') && 
        name.toLowerCase() !== 'id' &&
        !name.toLowerCase().endsWith('_id')) {
      const fieldName = name.charAt(0).toUpperCase() + name.slice(1);
      return `                    _buildDetailRow('${fieldName}', item.${name}?.toString() ?? 'N/A'),`;
    }
    return null;
  }).filter(Boolean).join('\n') : ''}
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }
}`;

  await fs.writeFile(path.join(screensDir, `${entityName.toLowerCase()}_detail_screen.dart`), detailScreenContent);
}

// Crear main.dart
async function createMainDart(libDir, entities) {
  const mainContent = `import 'package:flutter/material.dart';
import 'config/app_theme.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sistema Empresarial',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}`;

  await fs.writeFile(path.join(libDir, 'main.dart'), mainContent);
}

// Crear configuración de API
async function createApiConfig(configDir, backendPort) {
  const apiConfigContent = `class ApiConfig {
  // URL base del backend Spring Boot
  static const String baseUrl = 'http://localhost:${backendPort}/api';
  
  // Para dispositivos físicos, usar la IP de tu computadora:
  // static const String baseUrl = 'http://192.168.1.100:${backendPort}/api';
  
  // Timeout para las peticiones HTTP
  static const Duration timeout = Duration(seconds: 30);
  
  // Headers por defecto
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}`;

  await fs.writeFile(path.join(configDir, 'api_config.dart'), apiConfigContent);
}

// Crear tema de la aplicación
async function createAppTheme(configDir) {
  const appThemeContent = `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.grey[900]!,
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: Colors.grey[100],
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      cardTheme: CardThemeData(
        elevation: 6,
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      textTheme: TextTheme(
        titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black),
        bodyMedium: GoogleFonts.inter(fontSize: 14, color: Colors.black87),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blueGrey,
        brightness: Brightness.dark,
      ),
      scaffoldBackgroundColor: Colors.black,
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
      textTheme: TextTheme(
        titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
        bodyMedium: GoogleFonts.inter(fontSize: 14, color: Colors.white70),
      ),
      cardTheme: CardThemeData(
        elevation: 4,
        color: Color(0xFF141414),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
      ),
    );
  }
}`;

  await fs.writeFile(path.join(configDir, 'app_theme.dart'), appThemeContent);
}

// Crear servicio de navegación
async function createNavigationService(servicesDir) {
  const navigationServiceContent = `import 'package:flutter/material.dart';

class NavigationService {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  static BuildContext? get currentContext => navigatorKey.currentContext;

  static Future<T?> push<T>(Widget page) {
    return navigatorKey.currentState!.push<T>(
      MaterialPageRoute(builder: (context) => page),
    );
  }

  static Future<T?> pushReplacement<T>(Widget page) {
    return navigatorKey.currentState!.pushReplacement<T, dynamic>(
      MaterialPageRoute(builder: (context) => page),
    );
  }

  static void pop<T>([T? result]) {
    navigatorKey.currentState!.pop<T>(result);
  }

  static void popUntil(RoutePredicate predicate) {
    navigatorKey.currentState!.popUntil(predicate);
  }
}`;

  await fs.writeFile(path.join(servicesDir, 'navigation_service.dart'), navigationServiceContent);
}

// Crear servicio HTTP
async function createHttpService(servicesDir) {
  const httpServiceContent = `import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import '../config/api_config.dart';

class HttpService {
  static Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final response = await http.get(
        Uri.parse('\${ApiConfig.baseUrl}/\$endpoint'),
        headers: ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.timeout);

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Error de conexión: Verifica tu conexión a internet');
    } on HttpException {
      throw Exception('Error HTTP: No se pudo completar la petición');
    } catch (e) {
      throw Exception('Error inesperado: \$e');
    }
  }

  static Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('\${ApiConfig.baseUrl}/\$endpoint'),
        headers: ApiConfig.defaultHeaders,
        body: json.encode(data),
      ).timeout(ApiConfig.timeout);

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Error de conexión: Verifica tu conexión a internet');
    } on HttpException {
      throw Exception('Error HTTP: No se pudo completar la petición');
    } catch (e) {
      throw Exception('Error inesperado: \$e');
    }
  }

  static Future<Map<String, dynamic>> put(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.put(
        Uri.parse('\${ApiConfig.baseUrl}/\$endpoint'),
        headers: ApiConfig.defaultHeaders,
        body: json.encode(data),
      ).timeout(ApiConfig.timeout);

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Error de conexión: Verifica tu conexión a internet');
    } on HttpException {
      throw Exception('Error HTTP: No se pudo completar la petición');
    } catch (e) {
      throw Exception('Error inesperado: \$e');
    }
  }

  static Future<Map<String, dynamic>> patch(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.patch(
        Uri.parse('\${ApiConfig.baseUrl}/\$endpoint'),
        headers: ApiConfig.defaultHeaders,
        body: json.encode(data),
      ).timeout(ApiConfig.timeout);

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Error de conexión: Verifica tu conexión a internet');
    } on HttpException {
      throw Exception('Error HTTP: No se pudo completar la petición');
    } catch (e) {
      throw Exception('Error inesperado: \$e');
    }
  }

  static Future<bool> delete(String endpoint) async {
    try {
      final response = await http.delete(
        Uri.parse('\${ApiConfig.baseUrl}/\$endpoint'),
        headers: ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.timeout);

      return response.statusCode == 204;
    } on SocketException {
      throw Exception('Error de conexión: Verifica tu conexión a internet');
    } on HttpException {
      throw Exception('Error HTTP: No se pudo completar la petición');
    } catch (e) {
      throw Exception('Error inesperado: \$e');
    }
  }

  static Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) {
        return {};
      }
      return json.decode(response.body);
    } else {
      throw Exception('Error del servidor: \${response.statusCode}');
    }
  }
}`;

  await fs.writeFile(path.join(servicesDir, 'http_service.dart'), httpServiceContent);
}

// Crear pubspec.yaml
async function createPubspecYaml(projectDir, titulo) {
  const pubspecContent = `name: ${titulo.toLowerCase().replace(/\s+/g, '_')}
description: Sistema empresarial móvil generado automáticamente
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: ">=3.10.0"

dependencies:
  flutter:
    sdk: flutter
  
  # HTTP requests
  http: ^1.1.0
  
  # JSON serialization
  json_annotation: ^4.8.1
  
  # State management
  provider: ^6.1.1
  
  # UI components
  cupertino_icons: ^1.0.6
  
  # Utilities
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  
  # JSON code generation
  build_runner: ^2.4.7
  json_serializable: ^6.7.1
  
  # Google Fonts for improved typography
  google_fonts: ^4.0.3
  
  # Linting
  flutter_lints: ^3.0.1

flutter:
  uses-material-design: true
  
  # Assets
  # assets:
  #   - images/
  
  # Fonts
  # fonts:
  #   - family: CustomFont
  #     fonts:
  #       - asset: fonts/CustomFont-Regular.ttf
  #       - asset: fonts/CustomFont-Bold.ttf
  #         weight: 700`;

  await fs.writeFile(path.join(projectDir, 'pubspec.yaml'), pubspecContent);
}

// Crear configuración Android
async function createAndroidConfig(androidDir, titulo) {
  const appDir = path.join(androidDir, 'app', 'src', 'main');
  await fs.mkdir(appDir, { recursive: true });
  
  const javaDir = path.join(appDir, 'java', 'com', 'example', titulo.toLowerCase().replace(/\s+/g, '_'));
  await fs.mkdir(javaDir, { recursive: true });
  
  const resDir = path.join(appDir, 'res');
  await fs.mkdir(resDir, { recursive: true });
  
  // AndroidManifest.xml
  const manifestContent = `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:label="${titulo}"
        android:name="${titulo.replace(/\s+/g, '')}Application"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>`;

  await fs.writeFile(path.join(appDir, 'AndroidManifest.xml'), manifestContent);
  
  // MainActivity.java
  const mainActivityContent = `package com.example.${titulo.toLowerCase().replace(/\s+/g, '_')};

import io.flutter.embedding.android.FlutterActivity;

public class MainActivity extends FlutterActivity {
}`;

  await fs.writeFile(path.join(javaDir, 'MainActivity.java'), mainActivityContent);
  
  // build.gradle
  const buildGradleContent = `def localProperties = new Properties()
def localPropertiesFile = rootProject.file('local.properties')
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader('UTF-8') { reader ->
        localProperties.load(reader)
    }
}

def flutterRoot = localProperties.getProperty('flutter.sdk')
if (flutterRoot == null) {
    throw new GradleException("Flutter SDK not found. Define location with flutter.sdk in the local.properties file.")
}

def flutterVersionCode = localProperties.getProperty('flutter.versionCode')
if (flutterVersionCode == null) {
    flutterVersionCode = '1'
}

def flutterVersionName = localProperties.getProperty('flutter.versionName')
if (flutterVersionName == null) {
    flutterVersionName = '1.0'
}

apply plugin: 'com.android.application'
apply plugin: 'kotlin-android'
apply from: "$flutterRoot/packages/flutter_tools/gradle/flutter.gradle"

android {
    namespace "com.example.${titulo.toLowerCase().replace(/\s+/g, '_')}"
    compileSdkVersion flutter.compileSdkVersion
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = '1.8'
    }

    sourceSets {
        main.java.srcDirs += 'src/main/kotlin'
    }

    defaultConfig {
        applicationId "com.example.${titulo.toLowerCase().replace(/\s+/g, '_')}"
        minSdkVersion flutter.minSdkVersion
        targetSdkVersion flutter.targetSdkVersion
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
        }
    }
}

flutter {
    source '../..'
}`;

  await fs.writeFile(path.join(androidDir, 'app', 'build.gradle'), buildGradleContent);
}

// Crear configuración iOS
async function createIOSConfig(iosDir, titulo) {
  const runnerDir = path.join(iosDir, 'Runner');
  await fs.mkdir(runnerDir, { recursive: true });
  
  // Info.plist
  const infoPlistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>\$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleDisplayName</key>
	<string>${titulo}</string>
	<key>CFBundleExecutable</key>
	<string>\$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>\$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>\$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>\$(FLUTTER_BUILD_NAME)</string>
	<key>CFBundleSignature</key>
	<string>????</string>
	<key>CFBundleVersion</key>
	<string>\$(FLUTTER_BUILD_NUMBER)</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UILaunchStoryboardName</key>
	<string>LaunchScreen</string>
	<key>UIMainStoryboardFile</key>
	<string>Main</string>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UISupportedInterfaceOrientations~ipad</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationPortraitUpsideDown</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<false/>
	<key>CADisableMinimumFrameDurationOnPhone</key>
	<true/>
	<key>UIApplicationSupportsIndirectInputEvents</key>
	<true/>
</dict>
</plist>`;

  await fs.writeFile(path.join(runnerDir, 'Info.plist'), infoPlistContent);
}

// Crear configuración Web
async function createWebConfig(webDir, titulo) {
  // index.html
  const indexHtmlContent = `<!DOCTYPE html>
<html>
<head>
  <base href="$FLUTTER_BASE_HREF">
  <meta charset="UTF-8">
  <meta content="IE=Edge" http-equiv="X-UA-Compatible">
  <meta name="description" content="${titulo} - Sistema empresarial móvil">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="${titulo}">
  <link rel="apple-touch-icon" href="icons/Icon-192.png">
  <link rel="icon" type="image/png" href="favicon.png"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
  <link rel="manifest" href="manifest.json">
  <script defer src="main.dart.js"></script>
</head>
<body>
</body>
</html>`;

  await fs.writeFile(path.join(webDir, 'index.html'), indexHtmlContent);
  
  // manifest.json
  const manifestContent = `{
    "name": "${titulo}",
    "short_name": "${titulo}",
    "start_url": ".",
    "display": "standalone",
    "background_color": "#0175C2",
    "theme_color": "#0175C2",
    "description": "Sistema empresarial móvil generado automáticamente",
    "orientation": "portrait-primary",
    "prefer_related_applications": false,
    "icons": [
        {
            "src": "icons/Icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "icons/Icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}`;

  await fs.writeFile(path.join(webDir, 'manifest.json'), manifestContent);
}

// Crear tests
async function createTests(testDir, entities) {
  const testContent = `import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:${entities[0]?.toLowerCase().replace(/\s+/g, '_') || 'app'}/main.dart';

void main() {
  testWidgets('App starts and shows home screen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that the home screen is displayed
    expect(find.text('Sistema Empresarial'), findsOneWidget);
  });
}`;

  await fs.writeFile(path.join(testDir, 'widget_test.dart'), testContent);
}

// Crear README de Flutter
async function createFlutterReadme(projectDir, titulo, entities, backendPort) {
  const readmeContent = `# ${titulo} - Flutter Frontend

## 📱 Descripción

Frontend móvil para sistema de gestión empresarial generado automáticamente desde diagrama UML.

## 🚀 Características

- ✅ **CRUD Completo**: Gestión completa de todas las entidades
- ✅ **Navegación**: Entre pantallas de diferentes entidades
- ✅ **Formularios**: Validación y envío de datos
- ✅ **Listas**: Visualización de datos con paginación
- ✅ **Búsqueda**: Filtrado y búsqueda de registros
- ✅ **Estados**: Manejo de estados de carga y error
- ✅ **Responsive**: Adaptado a diferentes tamaños de pantalla
- ✅ **Temas**: Modo claro y oscuro
- ✅ **Conexión Automática**: Conectado al backend Spring Boot

## 📋 Prerrequisitos

- Flutter SDK 3.0 o superior
- Dart SDK 3.0 o superior
- Android Studio / VS Code con extensiones Flutter
- Backend Spring Boot ejecutándose en puerto ${backendPort}

## 🛠️ Instalación

### ⚠️ IMPORTANTE - Pasos en orden:

1. **Obtener dependencias**:
   \`\`\`bash
   flutter pub get
   \`\`\`

2. **Generar archivos de serialización JSON** (OBLIGATORIO):
   
   Los modelos usan \`json_serializable\` y necesitan generar archivos \`.g.dart\`:
   
   \`\`\`bash
   # Opción 1: Generar una vez
   flutter pub run build_runner build
   
   # Opción 2: Generar y eliminar conflictos
   flutter pub run build_runner build --delete-conflicting-outputs
   
   # Opción 3: Generar en modo watch (regenera automáticamente)
   flutter pub run build_runner watch
   \`\`\`
   
   ⚠️ **Sin este paso, verás errores de "part not found" y métodos no definidos**

3. **Verificar backend**:
   
   Asegúrate de que el backend Spring Boot esté ejecutándose:
   \`\`\`bash
   cd ../backend
   ./mvnw spring-boot:run
   \`\`\`
   
   El backend debe estar corriendo en \`http://localhost:${backendPort}\`

4. **Ejecutar la aplicación**:
   
   \`\`\`bash
   # En navegador Chrome
   flutter run -d chrome
   
   # En dispositivo Android conectado
   flutter run -d android
   
   # En emulador Android
   flutter run
   
   # Listar dispositivos disponibles
   flutter devices
   \`\`\`

## 🔧 Solución de Problemas Comunes

### Error: "part '*.g.dart' not found"
**Causa**: No se han generado los archivos de serialización JSON.

**Solución**:
\`\`\`bash
flutter pub run build_runner build --delete-conflicting-outputs
\`\`\`

### Error: "Build failed due to use of deleted Android v1 embedding"
**Causa**: Configuración de Android obsoleta.

**Solución**: Este proyecto ya usa Android v2 embedding. Si ves este error:
1. Elimina las carpetas \`android/\` e \`ios/\`
2. Regenera el proyecto con Flutter:
   \`\`\`bash
   flutter create --org com.example .
   \`\`\`
3. Vuelve a generar los archivos \`.g.dart\`:
   \`\`\`bash
   flutter pub get
   flutter pub run build_runner build --delete-conflicting-outputs
   \`\`\`

### Error: CardTheme vs CardThemeData
**Causa**: Incompatibilidad de versión de Flutter.

**Solución**: El archivo \`lib/config/app_theme.dart\` usa \`CardThemeData\` que es compatible con Flutter 3.0+.
\`\`\`bash
flutter upgrade
\`\`\`

### Error de conexión al backend
**Causa**: Backend no está ejecutándose o URL incorrecta.

**Solución**:
1. Verifica que el backend esté corriendo: \`curl http://localhost:${backendPort}/api\`
2. Para dispositivos físicos, usa la IP de tu PC en \`lib/config/api_config.dart\`:
   \`\`\`dart
   static const String baseUrl = 'http://192.168.1.X:${backendPort}/api';
   \`\`\`
3. Asegúrate de que el firewall permita conexiones al puerto ${backendPort}

## 🔗 Configuración de Conexión

El frontend está configurado para conectarse automáticamente al backend Spring Boot.

### Archivo de configuración: \`lib/config/api_config.dart\`

\`\`\`dart
class ApiConfig {
  static const String baseUrl = 'http://localhost:${backendPort}/api';
}
\`\`\`

### Para dispositivos físicos:
Cambiar la URL por la IP de tu computadora:

\`\`\`dart
static const String baseUrl = 'http://192.168.1.100:${backendPort}/api';
\`\`\`

## 📱 Pantallas Disponibles

${entities.map(entity => `
### ${entity}
- **Lista**: \`${entity}ListScreen\` - Visualización de todos los registros
- **Formulario**: \`${entity}FormScreen\` - Crear/editar registros
- **Detalle**: \`${entity}DetailScreen\` - Ver detalles de un registro
`).join('')}

## 🏗️ Arquitectura

\`\`\`
lib/
├── config/           # Configuración de la app
│   ├── api_config.dart
│   └── app_theme.dart
├── models/           # Modelos de datos
│   └── *.dart
├── services/         # Servicios API
│   ├── *_service.dart
│   ├── http_service.dart
│   └── navigation_service.dart
├── screens/          # Pantallas de la app
│   ├── home_screen.dart
│   └── *_*_screen.dart
├── widgets/          # Widgets reutilizables
└── main.dart         # Punto de entrada
\`\`\`

## 🧪 Testing

\`\`\`bash
# Ejecutar tests
flutter test

# Ejecutar tests con cobertura
flutter test --coverage
\`\`\`

## 📦 Build

### Android APK
\`\`\`bash
flutter build apk --release
\`\`\`

### iOS (requiere macOS)
\`\`\`bash
flutter build ios --release
\`\`\`

### Web
\`\`\`bash
flutter build web --release
\`\`\`

## 🔧 Configuración Avanzada

### Cambiar Puerto del Backend
1. Modificar \`lib/config/api_config.dart\`
2. Cambiar \`baseUrl\` al nuevo puerto

### Personalizar Tema
Editar \`lib/config/app_theme.dart\` para personalizar colores, fuentes, etc.

### Agregar Nuevas Funcionalidades
1. Crear modelo en \`lib/models/\`
2. Crear servicio en \`lib/services/\`
3. Crear pantallas en \`lib/screens/\`
4. Actualizar navegación en \`lib/screens/home_screen.dart\`

## 🆘 Solución de Problemas

### Error de conexión
- Verificar que el backend esté ejecutándose
- Verificar la URL en \`api_config.dart\`
- Verificar conectividad de red

### Error de compilación
\`\`\`bash
flutter clean
flutter pub get
flutter packages pub run build_runner build --delete-conflicting-outputs
\`\`\`

### Error de dependencias
\`\`\`bash
flutter pub deps
flutter pub upgrade
\`\`\`

## 📚 Dependencias Principales

- **http**: Peticiones HTTP al backend
- **json_annotation**: Serialización JSON
- **provider**: Gestión de estado
- **intl**: Internacionalización

---

**Frontend generado automáticamente desde diagrama UML**
**Fecha de generación**: ${new Date().toLocaleString()}
**Entidades incluidas**: ${entities.join(', ')}
**Backend conectado**: http://localhost:${backendPort}/api
`;

  await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent);
}

// Crear scripts de configuración y ayuda
async function createSetupScripts(projectDir) {
  // Script de PowerShell para Windows
  const setupPs1Content = `# Script de configuración para proyecto Flutter
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configurando proyecto Flutter..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Obteniendo dependencias..." -ForegroundColor Yellow
flutter pub get

Write-Host ""
Write-Host "2. Generando archivos de serialización JSON..." -ForegroundColor Yellow
flutter pub run build_runner build --delete-conflicting-outputs

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Configuración completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para ejecutar la aplicación:" -ForegroundColor Cyan
Write-Host "  flutter run -d chrome    # En navegador" -ForegroundColor White
Write-Host "  flutter run -d android   # En Android" -ForegroundColor White
Write-Host "  flutter devices          # Ver dispositivos" -ForegroundColor White
`;

  await fs.writeFile(path.join(projectDir, 'setup.ps1'), setupPs1Content);

  // Script de bash para Linux/Mac
  const setupShContent = `#!/bin/bash
echo "========================================"
echo "Configurando proyecto Flutter..."
echo "========================================"

echo ""
echo "1. Obteniendo dependencias..."
flutter pub get

echo ""
echo "2. Generando archivos de serialización JSON..."
flutter pub run build_runner build --delete-conflicting-outputs

echo ""
echo "========================================"
echo "Configuración completada!"
echo "========================================"
echo ""
echo "Para ejecutar la aplicación:"
echo "  flutter run -d chrome    # En navegador"
echo "  flutter run -d android   # En Android"
echo "  flutter devices          # Ver dispositivos"
`;

  await fs.writeFile(path.join(projectDir, 'setup.sh'), setupShContent);

  // Script para regenerar archivos .g.dart
  const regeneratePs1Content = `# Regenerar archivos .g.dart
Write-Host "Regenerando archivos de serialización..." -ForegroundColor Yellow
flutter pub run build_runner build --delete-conflicting-outputs
Write-Host "Completado!" -ForegroundColor Green
`;

  await fs.writeFile(path.join(projectDir, 'regenerate.ps1'), regeneratePs1Content);

  const regenerateShContent = `#!/bin/bash
echo "Regenerando archivos de serialización..."
flutter pub run build_runner build --delete-conflicting-outputs
echo "Completado!"
`;

  await fs.writeFile(path.join(projectDir, 'regenerate.sh'), regenerateShContent);

  // Crear archivo .gitignore
  const gitignoreContent = `# Miscellaneous
*.class
*.log
*.pyc
*.swp
.DS_Store
.atom/
.buildlog/
.history
.svn/
migrate_working_dir/

# IntelliJ related
*.iml
*.ipr
*.iws
.idea/

# Flutter/Dart/Pub related
**/doc/api/
**/ios/Flutter/.last_build_id
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
.pub/
/build/

# Symbolication related
app.*.symbols

# Obfuscation related
app.*.map.json

# Generated files
*.g.dart
*.freezed.dart

# Android related
**/android/**/gradle-wrapper.jar
**/android/.gradle
**/android/captures/
**/android/gradlew
**/android/gradlew.bat
**/android/local.properties
**/android/**/GeneratedPluginRegistrant.java
**/android/key.properties
*.jks

# iOS/XCode related
**/ios/**/*.mode1v3
**/ios/**/*.mode2v3
**/ios/**/*.moved-aside
**/ios/**/*.pbxuser
**/ios/**/*.perspectivev3
**/ios/**/*sync/
**/ios/**/.sconsign.dblite
**/ios/**/.tags*
**/ios/**/.vagrant/
**/ios/**/DerivedData/
**/ios/**/Icon?
**/ios/**/Pods/
**/ios/**/.symlinks/
**/ios/**/profile
**/ios/**/xcuserdata
**/ios/.generated/
**/ios/Flutter/.last_build_id
**/ios/Flutter/App.framework
**/ios/Flutter/Flutter.framework
**/ios/Flutter/Flutter.podspec
**/ios/Flutter/Generated.xcconfig
**/ios/Flutter/ephemeral
**/ios/Flutter/app.flx
**/ios/Flutter/app.zip
**/ios/Flutter/flutter_assets/
**/ios/Flutter/flutter_export_environment.sh
**/ios/ServiceDefinitions.json
**/ios/Runner/GeneratedPluginRegistrant.*

# Web related
lib/generated_plugin_registrant.dart

# Exceptions to above rules.
!**/ios/**/default.mode1v3
!**/ios/**/default.mode2v3
!**/ios/**/default.pbxuser
!**/ios/**/default.perspectivev3
`;

  await fs.writeFile(path.join(projectDir, '.gitignore'), gitignoreContent);
}

module.exports = {
  generateFlutterProject
};
