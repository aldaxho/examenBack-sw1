const fs = require('fs');
const path = require('path');

// Función para convertir JSON del diagrama a esquema OpenAPI
function convertDiagramToOpenAPI(diagramaJSON, titulo) {
  const cleanTitulo = titulo ? titulo.replace(/[^\w\s]/g, '').trim() : 'Diagrama';
  
  const openAPISchema = {
    openapi: "3.0.0",
    info: {
      title: `${cleanTitulo} API`,
      description: `API generada automáticamente desde diagrama: ${cleanTitulo}`,
      version: "1.0.0"
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Servidor de desarrollo"
      }
    ],
    components: {
      schemas: {},
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    paths: {}
  };

  // Crear mapa de clases por ID
  const classMap = {};
  if (diagramaJSON.classes) {
    diagramaJSON.classes.forEach((clase, index) => {
      let entityName = cleanClassName(clase.name);
      
      // Si el nombre está vacío o es muy genérico, crear uno único
      if (!entityName || entityName === 'NuevaClase') {
        entityName = `Entity${index + 1}`;
      }
      
      classMap[clase.id] = { ...clase, correctedName: entityName };
      
      // Crear esquema de la entidad
      const schema = {
        type: "object",
        properties: {
          id: {
            type: "integer",
            format: "int64",
            description: "ID único de la entidad"
          }
        },
        required: ["id"]
      };
      
      // Agregar atributos originales
      if (clase.attributes && clase.attributes.length > 0) {
        clase.attributes.forEach(attr => {
          const { name, type, isPrimaryKey } = parseAttribute(attr);
          if (!isPrimaryKey && name && !name.toLowerCase().includes('id_')) {
            schema.properties[name] = mapOpenAPIType(type);
          }
        });
      }
      
      // Agregar foreign keys detectadas automáticamente
      const fkMap = detectForeignKeys(diagramaJSON.classes, diagramaJSON.relations || []);
      if (fkMap[clase.id]) {
        fkMap[clase.id].forEach(fk => {
          schema.properties[fk.name] = {
            type: "integer",
            format: "int64",
            description: `Referencia a ${fk.targetEntity}`
          };
        });
      }
      
      openAPISchema.components.schemas[entityName] = schema;
      
      // Crear esquema para DTO de creación
      const createSchema = JSON.parse(JSON.stringify(schema));
      delete createSchema.properties.id; // No incluir ID en creación
      openAPISchema.components.schemas[`${entityName}Create`] = createSchema;
      
      // Crear esquema para DTO de actualización
      const updateSchema = JSON.parse(JSON.stringify(schema));
      delete updateSchema.properties.id; // ID se pasa en la URL
      openAPISchema.components.schemas[`${entityName}Update`] = updateSchema;
      
      // Generar paths para CRUD
      const entityPath = `/${entityName.toLowerCase()}s`;
      
      openAPISchema.paths[entityPath] = {
        get: {
          summary: `Obtener todos los ${entityName}s`,
          tags: [entityName],
          responses: {
            "200": {
              description: "Lista de entidades",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: `#/components/schemas/${entityName}` }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: `Crear nuevo ${entityName}`,
          tags: [entityName],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${entityName}Create` }
              }
            }
          },
          responses: {
            "201": {
              description: "Entidad creada",
              content: {
                "application/json": {
                  schema: { $ref: `#/components/schemas/${entityName}` }
                }
              }
            }
          }
        }
      };
      
      // Path para operaciones individuales
      const individualPath = `${entityPath}/{id}`;
      openAPISchema.paths[individualPath] = {
        get: {
          summary: `Obtener ${entityName} por ID`,
          tags: [entityName],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", format: "int64" }
            }
          ],
          responses: {
            "200": {
              description: "Entidad encontrada",
              content: {
                "application/json": {
                  schema: { $ref: `#/components/schemas/${entityName}` }
                }
              }
            },
            "404": {
              description: "Entidad no encontrada"
            }
          }
        },
        put: {
          summary: `Actualizar ${entityName}`,
          tags: [entityName],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", format: "int64" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${entityName}Update` }
              }
            }
          },
          responses: {
            "200": {
              description: "Entidad actualizada",
              content: {
                "application/json": {
                  schema: { $ref: `#/components/schemas/${entityName}` }
                }
              }
            }
          }
        },
        delete: {
          summary: `Eliminar ${entityName}`,
          tags: [entityName],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer", format: "int64" }
            }
          ],
          responses: {
            "204": {
              description: "Entidad eliminada"
            },
            "404": {
              description: "Entidad no encontrada"
            }
          }
        }
      };
    });
  }
  
  return openAPISchema;
}

// Función para limpiar nombres de clases
function cleanClassName(name) {
  if (!name) return 'Entity';
  return name.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]/, 'E$&');
}

// Función para parsear atributos
function parseAttribute(attr) {
  const name = attr.name || 'field';
  const type = attr.type || 'String';
  const isPrimaryKey = name.toLowerCase().includes('id') && 
                      (name.toLowerCase() === 'id' || name.toLowerCase().endsWith('id'));
  
  return { name, type, isPrimaryKey };
}

// Función para mapear tipos a OpenAPI
function mapOpenAPIType(type) {
  const typeMap = {
    'String': { type: 'string' },
    'Integer': { type: 'integer', format: 'int32' },
    'Long': { type: 'integer', format: 'int64' },
    'BigDecimal': { type: 'number', format: 'double' },
    'Boolean': { type: 'boolean' },
    'LocalDate': { type: 'string', format: 'date' },
    'LocalDateTime': { type: 'string', format: 'date-time' },
    'Date': { type: 'string', format: 'date-time' }
  };
  
  return typeMap[type] || { type: 'string' };
}

// Función para detectar foreign keys
function detectForeignKeys(classes, relations) {
  const fkMap = {};
  
  relations.forEach(relation => {
    const sourceClass = classes.find(c => c.id === relation.source);
    const targetClass = classes.find(c => c.id === relation.target);
    
    if (sourceClass && targetClass) {
      if (!fkMap[sourceClass.id]) {
        fkMap[sourceClass.id] = [];
      }
      
      const fkName = `id${cleanClassName(targetClass.name)}`;
      fkMap[sourceClass.id].push({
        name: fkName,
        type: 'Long',
        targetEntity: cleanClassName(targetClass.name)
      });
    }
  });
  
  return fkMap;
}

// Función para generar proyecto Spring Boot
async function generateSpringBootProject(diagramaJSON, titulo) {
  console.log('🚀 Generando proyecto Spring Boot con OpenAPI Generator...');
  
  // Convertir a OpenAPI
  const openAPISchema = convertDiagramToOpenAPI(diagramaJSON, titulo);
  
  // Crear directorio temporal
  const timestamp = Date.now();
  const projectName = `spring-backend-openapi-${timestamp}`;
  const baseDir = path.join(__dirname, '../temp');
  const projectDir = path.join(baseDir, projectName);
  
  await fs.promises.mkdir(projectDir, { recursive: true });
  
  // Guardar esquema OpenAPI
  const openAPIPath = path.join(projectDir, 'openapi.yaml');
  await fs.promises.writeFile(openAPIPath, JSON.stringify(openAPISchema, null, 2));
  
  console.log(`📄 Esquema OpenAPI guardado en: ${openAPIPath}`);
  
  // Generar proyecto Spring Boot con OpenAPI Generator
  const { exec } = require('child_process');
  const util = require('util');
  const execAsync = util.promisify(exec);
  
  try {
    console.log('🏗️ Generando proyecto Spring Boot...');
    
    const command = `openapi-generator-cli generate -i ${openAPIPath} -g spring -o ${projectDir} --additional-properties=packageName=com.example.demo,apiPackage=com.example.demo.api,modelPackage=com.example.demo.model,invokerPackage=com.example.demo,basePackage=com.example.demo,library=spring-boot,dateLibrary=java8,useTags=true,interfaceOnly=false,returnResponse=false,useBeanValidation=true,performBeanValidation=true,useOptional=false,useSpringBoot3=true`;
    
    await execAsync(command);
    
    console.log('✅ Proyecto Spring Boot generado exitosamente');
    
    // Crear README con instrucciones
    const readmeContent = `# ${titulo} - Spring Boot API

## 🚀 Cómo ejecutar

### Prerrequisitos
- Java 17 o superior
- Maven 3.6+

### Pasos
1. Navegar al directorio del proyecto:
   \`\`\`bash
   cd ${projectName}
   \`\`\`

2. Compilar el proyecto:
   \`\`\`bash
   mvn clean compile
   \`\`\`

3. Ejecutar la aplicación:
   \`\`\`bash
   mvn spring-boot:run
   \`\`\`

4. La API estará disponible en: http://localhost:8080

### 📚 Documentación API
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

### 🗄️ Base de datos
Por defecto usa H2 en memoria. Para cambiar a PostgreSQL:
1. Agregar dependencia en pom.xml
2. Configurar application.properties
3. Crear base de datos

### 📝 Entidades generadas
${Object.keys(openAPISchema.components.schemas).filter(s => !s.includes('Create') && !s.includes('Update')).map(entity => `- ${entity}`).join('\n')}

¡Proyecto generado automáticamente desde diagrama UML! 🎉
`;
    
    await fs.promises.writeFile(path.join(projectDir, 'README.md'), readmeContent);
    
    return {
      success: true,
      projectPath: projectDir,
      projectName: projectName,
      entities: Object.keys(openAPISchema.components.schemas).filter(s => !s.includes('Create') && !s.includes('Update'))
    };
    
  } catch (error) {
    console.error('❌ Error generando proyecto:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  convertDiagramToOpenAPI,
  generateSpringBootProject
};
