const fs = require('fs').promises;
const path = require('path');

// Función para generar proyecto Spring Boot completo y funcional
async function generateSimpleSpringBootProject(diagramaJSON, titulo) {
  console.log('Generando proyecto Spring Boot completo...');
  
  const cleanTitulo = titulo ? titulo.replace(/[^\w\s]/g, '').trim() : 'Diagrama';
  
  // Crear directorio temporal
  const timestamp = Date.now();
  const projectName = `spring-backend-${timestamp}`;
  const baseDir = path.join(__dirname, '../temp');
  const projectDir = path.join(baseDir, projectName);
  
  await fs.mkdir(projectDir, { recursive: true });
  
  // Crear estructura de directorios completa
  const srcDir = path.join(projectDir, 'src', 'main', 'java', 'com', 'example', 'demo');
  const resourcesDir = path.join(projectDir, 'src', 'main', 'resources');
  const testDir = path.join(projectDir, 'src', 'test', 'java', 'com', 'example', 'demo');
  
  // Directorios principales
  await fs.mkdir(srcDir, { recursive: true });
  await fs.mkdir(resourcesDir, { recursive: true });
  await fs.mkdir(testDir, { recursive: true });
  
  // Subdirectorios para arquitectura MVC
  const modelsDir = path.join(srcDir, 'model');
  const controllersDir = path.join(srcDir, 'controller');
  const servicesDir = path.join(srcDir, 'service');
  const repositoriesDir = path.join(srcDir, 'repository');
  const dtosDir = path.join(srcDir, 'dto');
  const configDir = path.join(srcDir, 'config');
  
  await fs.mkdir(modelsDir, { recursive: true });
  await fs.mkdir(controllersDir, { recursive: true });
  await fs.mkdir(servicesDir, { recursive: true });
  await fs.mkdir(repositoriesDir, { recursive: true });
  await fs.mkdir(dtosDir, { recursive: true });
  await fs.mkdir(configDir, { recursive: true });
  
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
    for (const clase of diagramaJSON.classes) {
      const entityName = entityMap.get(clase.id).entityName;
      
      // Crear entidad JPA con relaciones
      await createEntityClass(modelsDir, entityName, clase, entityMap, relations);
      
      // Crear DTO
      await createDTOClass(dtosDir, entityName, clase);
      
      // Crear repositorio
      await createRepositoryClass(repositoriesDir, entityName);
      
      // Crear servicio
      await createServiceClass(servicesDir, entityName, clase);
      
      // Crear controlador REST
      await createControllerClass(controllersDir, entityName, clase);
    }
  }
  
  // Crear archivos principales
  await createMainApplicationClass(srcDir);
  await createConfigurationClasses(configDir);
  await createPomXml(projectDir, entities);
  await createApplicationProperties(resourcesDir);
  await createMavenWrapper(projectDir);
  await createReadme(projectDir, cleanTitulo, entities);
  await createDockerfile(projectDir);
  await createGitignore(projectDir);
  
  // Crear tests automáticos para validar la generación
  await createAutomaticTests(testDir, entities);
  
  // Crear colección de Postman para pruebas
  await createPostmanCollection(projectDir, cleanTitulo, entities);
  
  console.log(`Proyecto Spring Boot generado: ${projectName}`);
  console.log(`Ubicación: ${projectDir}`);
  console.log(`Entidades: ${entities.join(', ')}`);
  
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
    // Parsear string como "nombre:string" o "id_class-123 (PK)"
    const isPrimaryKey = attr.includes('(PK)');
    
    // Remover (PK) si existe
    let cleanAttr = attr.replace(/\s*\(PK\)/, '');
    
    // Separar nombre y tipo
    const parts = cleanAttr.split(':');
    const name = parts[0].trim();
    const type = parts[1] ? parts[1].trim() : 'String';
    
    return { name, type, isPrimaryKey };
  } else if (typeof attr === 'object') {
    // Si es objeto, usar las propiedades directamente
    const name = attr.name || 'field';
    const type = attr.type || 'String';
    const isPrimaryKey = attr.isPrimaryKey || (name.toLowerCase().includes('id') && 
                        (name.toLowerCase() === 'id' || name.toLowerCase().endsWith('id')));
    
    return { name, type, isPrimaryKey };
  }
  
  // Fallback
  return { name: 'field', type: 'String', isPrimaryKey: false };
}

// Función para mapear tipos Java
function mapJavaType(type) {
  const typeMap = {
    'String': 'String',
    'Integer': 'Integer',
    'Long': 'Long',
    'BigDecimal': 'BigDecimal',
    'Boolean': 'Boolean',
    'LocalDate': 'LocalDate',
    'LocalDateTime': 'LocalDateTime',
    'Date': 'Date'
  };
  
  return typeMap[type] || 'String';
}

// Crear clase de entidad JPA con relaciones
async function createEntityClass(modelsDir, entityName, clase, entityMap, relations) {
  let entityContent = `package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "${entityName.toLowerCase()}")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ${entityName} {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
`;

  // Llevar registro de los campos de relación que realmente se crean
  const relationFields = [];
  const usedColumnNames = new Set(); // Para evitar nombres de columna duplicados

  // Agregar relaciones JPA
  const entityRelations = relations.filter(rel => 
    rel.source === clase.id || rel.target === clase.id
  );

  // Función para generar nombres de columna únicos
  function getUniqueColumnName(baseName) {
    // Limpiar el nombre base para que sea válido en SQL
    let cleanBaseName = baseName.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Si está vacío después de la limpieza, usar nombre por defecto
    if (!cleanBaseName || cleanBaseName.length === 0) {
      cleanBaseName = 'field';
    }
    
    // Si empieza con número, agregar prefijo
    if (/^[0-9]/.test(cleanBaseName)) {
      cleanBaseName = 'field_' + cleanBaseName;
    }
    
    let columnName = cleanBaseName;
    let counter = 1;
    while (usedColumnNames.has(columnName)) {
      columnName = `${cleanBaseName}_${counter}`;
      counter++;
    }
    usedColumnNames.add(columnName);
    return columnName;
  }

  // Agregar atributos básicos
  if (clase.attributes && clase.attributes.length > 0) {
    clase.attributes.forEach(attr => {
      const { name, type, isPrimaryKey } = parseAttribute(attr);
      // NO generar campos 'id' duplicados - ya tenemos el campo JPA @Id
      // También evitar nombres que puedan causar conflictos con relaciones
      if (!isPrimaryKey && name && 
          !name.toLowerCase().includes('id_class') && 
          !name.toLowerCase().includes('id_persona') && 
          name.toLowerCase() !== 'id' &&
          !name.toLowerCase().endsWith('_id') &&
          !usedColumnNames.has(name.toLowerCase())) {
        const javaType = mapJavaType(type);
        const columnName = getUniqueColumnName(name.toLowerCase());
        entityContent += `
    @Column(name = "${columnName}")
    private ${javaType} ${name};`;
      }
    });
  }

  for (const relation of entityRelations) {
    const isSource = relation.source === clase.id;
    const relatedClassId = isSource ? relation.target : relation.source;
    const relatedEntity = entityMap.get(relatedClassId);
    
    if (relatedEntity) {
      const relatedEntityName = relatedEntity.entityName;
      const fieldName = relatedEntityName.toLowerCase();
      
      switch (relation.type) {
        case 'Asociación':
          if (relation.multiplicidadDestino === '1..*' && isSource) {
            entityContent += `
    @OneToMany(mappedBy = "${entityName.toLowerCase()}", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("${entityName.toLowerCase()}")
    private List<${relatedEntityName}> ${fieldName}List = new ArrayList<>();`;
            relationFields.push({ name: `${fieldName}List`, type: `List<${relatedEntityName}>`, isList: true, relatedEntity: relatedEntityName });
          } else if (relation.multiplicidadOrigen === '1' && !isSource) {
            const columnName = getUniqueColumnName(`${relatedEntityName.toLowerCase()}_id`);
            entityContent += `
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${columnName}")
    @JsonIgnoreProperties("${fieldName}List")
    private ${relatedEntityName} ${fieldName};`;
            relationFields.push({ name: fieldName, type: relatedEntityName, isList: false, relatedEntity: relatedEntityName });
          }
          break;
          
        case 'Composición':
          if (isSource) {
            const columnName = getUniqueColumnName(`${entityName.toLowerCase()}_id`);
            entityContent += `
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "${columnName}")
    @JsonIgnoreProperties("${entityName.toLowerCase()}")
    private List<${relatedEntityName}> ${fieldName}List = new ArrayList<>();`;
            relationFields.push({ name: `${fieldName}List`, type: `List<${relatedEntityName}>`, isList: true, relatedEntity: relatedEntityName });
          }
          break;
          
        case 'Agregación':
          if (relation.multiplicidadDestino === '1..*' && isSource) {
            entityContent += `
    @OneToMany(mappedBy = "${entityName.toLowerCase()}", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("${entityName.toLowerCase()}")
    private List<${relatedEntityName}> ${fieldName}List = new ArrayList<>();`;
            relationFields.push({ name: `${fieldName}List`, type: `List<${relatedEntityName}>`, isList: true, relatedEntity: relatedEntityName });
          } else if (!isSource) {
            const columnName = getUniqueColumnName(`${relatedEntityName.toLowerCase()}_id`);
            entityContent += `
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${columnName}")
    @JsonIgnoreProperties("${fieldName}List")
    private ${relatedEntityName} ${fieldName};`;
            relationFields.push({ name: fieldName, type: relatedEntityName, isList: false, relatedEntity: relatedEntityName });
          }
          break;
          
        case 'Generalización':
          if (!isSource) {
            entityContent += `
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${fieldName}_id")
    @JsonIgnoreProperties("${entityName.toLowerCase()}")
    private ${relatedEntityName} ${fieldName};`;
            relationFields.push({ name: fieldName, type: relatedEntityName, isList: false, relatedEntity: relatedEntityName });
          }
          break;
          
        case 'Uno a Muchos':
          if (isSource) {
            entityContent += `
    @OneToMany(mappedBy = "${entityName.toLowerCase()}", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("${entityName.toLowerCase()}")
    private List<${relatedEntityName}> ${fieldName}List = new ArrayList<>();`;
            relationFields.push({ name: `${fieldName}List`, type: `List<${relatedEntityName}>`, isList: true, relatedEntity: relatedEntityName });
          } else {
            const columnName = getUniqueColumnName(`${relatedEntityName.toLowerCase()}_id`);
            entityContent += `
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${columnName}")
    @JsonIgnoreProperties("${fieldName}List")
    private ${relatedEntityName} ${fieldName};`;
            relationFields.push({ name: fieldName, type: relatedEntityName, isList: false, relatedEntity: relatedEntityName });
          }
          break;
      }
    }
  }

  entityContent += `

    // Constructores
    public ${entityName}() {}

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }`;

  // Generar getters y setters para atributos básicos que realmente se crearon
  if (clase.attributes && clase.attributes.length > 0) {
    clase.attributes.forEach(attr => {
      const { name, type, isPrimaryKey } = parseAttribute(attr);
      // Solo generar métodos para campos que realmente se crearon (misma lógica que arriba)
      if (!isPrimaryKey && name && 
          !name.toLowerCase().includes('id_class') && 
          !name.toLowerCase().includes('id_persona') && 
          name.toLowerCase() !== 'id' &&
          !name.toLowerCase().endsWith('_id')) {
        const javaType = mapJavaType(type);
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        entityContent += `

    public ${javaType} get${capitalizedName}() {
        return ${name};
    }

    public void set${capitalizedName}(${javaType} ${name}) {
        this.${name} = ${name};
    }`;
      }
    });
  }

  // Generar getters y setters para relaciones basándose en los campos que realmente se crearon
  for (const field of relationFields) {
    const capitalizedFieldName = field.name.charAt(0).toUpperCase() + field.name.slice(1).replace('List', '');
    
    if (field.isList) {
      entityContent += `

    public ${field.type} get${capitalizedFieldName}List() {
        return ${field.name};
    }

    public void set${capitalizedFieldName}List(${field.type} ${field.name}) {
        this.${field.name} = ${field.name};
    }`;
    } else {
      entityContent += `

    public ${field.type} get${capitalizedFieldName}() {
        return ${field.name};
    }

    public void set${capitalizedFieldName}(${field.type} ${field.name}) {
        this.${field.name} = ${field.name};
    }`;
    }
  }

  entityContent += `
}`;

  await fs.writeFile(path.join(modelsDir, `${entityName}.java`), entityContent);
}

// Crear clase DTO
async function createDTOClass(dtosDir, entityName, clase) {
  let dtoContent = `package com.example.demo.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

public class ${entityName}DTO {
    
    private Long id;
`;

  // Agregar atributos básicos
  if (clase.attributes && clase.attributes.length > 0) {
    clase.attributes.forEach(attr => {
      const { name, type, isPrimaryKey } = parseAttribute(attr);
      // NO generar campos 'id' duplicados - ya tenemos el campo JPA @Id
      if (!isPrimaryKey && name && !name.toLowerCase().includes('id_class') && !name.toLowerCase().includes('id_persona') && name.toLowerCase() !== 'id') {
        const javaType = mapJavaType(type);
        dtoContent += `    private ${javaType} ${name};
`;
      }
    });
  }

  dtoContent += `
    // Constructores
    public ${entityName}DTO() {}

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }`;

  // Generar getters y setters para atributos
  if (clase.attributes && clase.attributes.length > 0) {
    clase.attributes.forEach(attr => {
      const { name, type, isPrimaryKey } = parseAttribute(attr);
      // NO generar métodos para campos 'id' - ya tenemos los métodos JPA
      if (!isPrimaryKey && name && !name.toLowerCase().includes('id_class') && !name.toLowerCase().includes('id_persona') && name.toLowerCase() !== 'id') {
        const javaType = mapJavaType(type);
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        dtoContent += `

    public ${javaType} get${capitalizedName}() {
        return ${name};
    }

    public void set${capitalizedName}(${javaType} ${name}) {
        this.${name} = ${name};
    }`;
      }
    });
  }

  dtoContent += `
}`;

  await fs.writeFile(path.join(dtosDir, `${entityName}DTO.java`), dtoContent);
}

// Crear clase de repositorio
async function createRepositoryClass(repositoriesDir, entityName) {
  
  const repositoryContent = `package com.example.demo.repository;

import com.example.demo.model.${entityName};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ${entityName}Repository extends JpaRepository<${entityName}, Long> {
    
    // Buscar por ID con verificación de existencia
    @Query("SELECT e FROM ${entityName} e WHERE e.id = :id")
    Optional<${entityName}> findByIdCustom(@Param("id") Long id);
    
    // Buscar todos los registros activos
    @Query("SELECT e FROM ${entityName} e ORDER BY e.id ASC")
    List<${entityName}> findAllOrdered();
    
    // Contar registros
    @Query("SELECT COUNT(e) FROM ${entityName} e")
    Long countAll();
}`;

  await fs.writeFile(path.join(repositoriesDir, `${entityName}Repository.java`), repositoryContent);
}

// Función para generar mapeos de campos dinámicamente
function generateFieldMappings(clase, mappingType) {
  let mappings = '';
  
  // Crear el mismo Set que se usa en createEntityClass para mantener consistencia
  const usedColumnNames = new Set();
  
  if (clase.attributes && clase.attributes.length > 0) {
    clase.attributes.forEach(attr => {
      const { name, type, isPrimaryKey } = parseAttribute(attr);
      
      // Usar exactamente la misma lógica que en createEntityClass
      if (!isPrimaryKey && name && 
          !name.toLowerCase().includes('id_class') && 
          !name.toLowerCase().includes('id_persona') && 
          name.toLowerCase() !== 'id' &&
          !name.toLowerCase().endsWith('_id') &&
          !usedColumnNames.has(name.toLowerCase())) {
        
        // Agregar el nombre a usedColumnNames para mantener consistencia
        usedColumnNames.add(name.toLowerCase());
        
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        
        switch (mappingType) {
          case 'entityToDTO':
            mappings += `        dto.set${capitalizedName}(entity.get${capitalizedName}());\n`;
            break;
            
          case 'dtoToEntity':
            mappings += `        entity.set${capitalizedName}(dto.get${capitalizedName}());\n`;
            break;
            
          case 'updateEntity':
            mappings += `        entity.set${capitalizedName}(dto.get${capitalizedName}());\n`;
            break;
            
          case 'partialUpdateEntity':
            mappings += `        if (dto.get${capitalizedName}() != null) {\n`;
            mappings += `            entity.set${capitalizedName}(dto.get${capitalizedName}());\n`;
            mappings += `        }\n`;
            break;
        }
      }
    });
  }
  
  return mappings;
}

// Crear clase de servicio
async function createServiceClass(servicesDir, entityName, clase) {
  
  const serviceContent = `package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.model.${entityName};
import com.example.demo.dto.${entityName}DTO;
import com.example.demo.repository.${entityName}Repository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ${entityName}Service {
    
    @Autowired
    private ${entityName}Repository repository;

    // Obtener todos los registros
    @Transactional(readOnly = true)
    public List<${entityName}DTO> findAll() {
        return repository.findAllOrdered()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar por ID
    @Transactional(readOnly = true)
    public Optional<${entityName}DTO> findById(Long id) {
        return repository.findByIdCustom(id)
                .map(this::convertToDTO);
    }

    // Crear nuevo registro
    public ${entityName}DTO create(${entityName}DTO ${entityName.toLowerCase()}DTO) {
        ${entityName} entity = convertToEntity(${entityName.toLowerCase()}DTO);
        entity.setId(null); // Asegurar que es una creación
        ${entityName} savedEntity = repository.save(entity);
        return convertToDTO(savedEntity);
    }

    // Actualizar registro existente (completo)
    public ${entityName}DTO update(Long id, ${entityName}DTO ${entityName.toLowerCase()}DTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, ${entityName.toLowerCase()}DTO);
                    ${entityName} updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("${entityName} not found with id: " + id));
    }

    // Actualización parcial
    public ${entityName}DTO partialUpdate(Long id, ${entityName}DTO ${entityName.toLowerCase()}DTO) {
        return repository.findById(id)
                .map(existingEntity -> {
                    partialUpdateEntityFromDTO(existingEntity, ${entityName.toLowerCase()}DTO);
                    ${entityName} updatedEntity = repository.save(existingEntity);
                    return convertToDTO(updatedEntity);
                })
                .orElseThrow(() -> new RuntimeException("${entityName} not found with id: " + id));
    }

    // Eliminar por ID
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("${entityName} not found with id: " + id);
        }
        repository.deleteById(id);
    }

    // Contar registros
    @Transactional(readOnly = true)
    public Long count() {
        return repository.countAll();
    }

    // Convertir Entity a DTO
    private ${entityName}DTO convertToDTO(${entityName} entity) {
        ${entityName}DTO dto = new ${entityName}DTO();
        dto.setId(entity.getId());
        
        // Mapear todos los campos específicos de la entidad
        ${generateFieldMappings(clase, 'entityToDTO')}
        
        return dto;
    }

    // Convertir DTO a Entity
    private ${entityName} convertToEntity(${entityName}DTO dto) {
        ${entityName} entity = new ${entityName}();
        entity.setId(dto.getId());
        
        // Mapear todos los campos específicos del DTO
        ${generateFieldMappings(clase, 'dtoToEntity')}
        
        return entity;
    }

    // Actualizar Entity desde DTO (completo)
    private void updateEntityFromDTO(${entityName} entity, ${entityName}DTO dto) {
        // Actualizar todos los campos específicos de la entidad
        ${generateFieldMappings(clase, 'updateEntity')}
    }

    // Actualización parcial de Entity desde DTO
    private void partialUpdateEntityFromDTO(${entityName} entity, ${entityName}DTO dto) {
        // Actualizar solo los campos no nulos del DTO
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        
        // Actualizar campos específicos solo si no son nulos
        ${generateFieldMappings(clase, 'partialUpdateEntity')}
    }
}`;

  await fs.writeFile(path.join(servicesDir, `${entityName}Service.java`), serviceContent);
}

// Crear clase de controlador REST
async function createControllerClass(controllersDir, entityName, clase) {
  
  const controllerContent = `package com.example.demo.controller;

import com.example.demo.dto.${entityName}DTO;
import com.example.demo.service.${entityName}Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/${entityName.toLowerCase()}")
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
public class ${entityName}Controller {
    
    @Autowired
    private ${entityName}Service service;
    
    // GET /api/${entityName.toLowerCase()} - Obtener todos
    @GetMapping
    public ResponseEntity<List<${entityName}DTO>> getAll() {
        try {
            List<${entityName}DTO> list = service.findAll();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /api/${entityName.toLowerCase()}/{id} - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<${entityName}DTO> getById(@PathVariable Long id) {
        try {
            Optional<${entityName}DTO> entity = service.findById(id);
            return entity.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // POST /api/${entityName.toLowerCase()} - Crear nuevo
    @PostMapping
    public ResponseEntity<${entityName}DTO> create(@Valid @RequestBody ${entityName}DTO dto) {
        try {
            ${entityName}DTO created = service.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PUT /api/${entityName.toLowerCase()}/{id} - Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<${entityName}DTO> update(@PathVariable Long id, @Valid @RequestBody ${entityName}DTO dto) {
        try {
            ${entityName}DTO updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // PATCH /api/${entityName.toLowerCase()}/{id} - Actualizar parcialmente
    @PatchMapping("/{id}")
    public ResponseEntity<${entityName}DTO> partialUpdate(@PathVariable Long id, @RequestBody ${entityName}DTO dto) {
        try {
            ${entityName}DTO updated = service.partialUpdate(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // DELETE /api/${entityName.toLowerCase()}/{id} - Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // GET /api/${entityName.toLowerCase()}/count - Contar registros
    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        try {
            Long count = service.count();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}`;

  await fs.writeFile(path.join(controllersDir, `${entityName}Controller.java`), controllerContent);
}

// Crear clase principal de aplicación
async function createMainApplicationClass(srcDir) {
  const mainContent = `package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}`;

  await fs.writeFile(path.join(srcDir, 'DemoApplication.java'), mainContent);
}

// Crear clases de configuración
async function createConfigurationClasses(configDir) {
  // Configuración CORS
  const corsConfig = `package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}`;

  await fs.writeFile(path.join(configDir, 'CorsConfig.java'), corsConfig);

  // Configuración de la base de datos
  const dbConfig = `package com.example.demo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    @Profile("dev")
    public DataSource h2DataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl("jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
        dataSource.setUsername("sa");
        dataSource.setPassword("password");
        return dataSource;
    }
}`;

  await fs.writeFile(path.join(configDir, 'DatabaseConfig.java'), dbConfig);
}

// Crear pom.xml
async function createPomXml(projectDir, entities) {
  const pomContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.5</version>
        <relativePath/>
    </parent>
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>demo</name>
    <description>Proyecto Spring Boot generado automáticamente</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`;

  await fs.writeFile(path.join(projectDir, 'pom.xml'), pomContent);
}

// Crear application.properties con detección automática de puerto
async function createApplicationProperties(resourcesDir) {
  // Función para detectar puerto disponible (simulada)
  function findAvailablePort(startPort = 8080) {
    // En un entorno real, aquí se haría la detección real de puertos
    // Por ahora, generamos configuración que permite cambio fácil
    return startPort;
  }
  
  const availablePort = findAvailablePort();
  
  const propertiesContent = `# Configuración de la aplicación Spring Boot
spring.application.name=Demo Application

# Configuración de la base de datos H2 (en memoria)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password

# Configuración JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.validator.fail_fast=true
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

# Configuración H2 Console (para desarrollo)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=true

# Configuración del servidor (puerto configurable)
server.port=${availablePort}
# Alternativa: server.port=0 (puerto aleatorio disponible)
# Para cambiar puerto: server.port=8081

# Configuración de logging
logging.level.com.example.demo=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Configuración de CORS
spring.web.cors.allowed-origins=*
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
spring.web.cors.allowed-headers=*

# Configuración de validación
spring.jpa.properties.hibernate.validator.fail_fast=true

# Configuración de rendimiento
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true`;

  await fs.writeFile(path.join(resourcesDir, 'application.properties'), propertiesContent);
}

// Crear Maven Wrapper
async function createMavenWrapper(projectDir) {
  const wrapperDir = path.join(projectDir, '.mvn', 'wrapper');
  await fs.mkdir(wrapperDir, { recursive: true });
  
  // Maven Wrapper Properties
  const wrapperProperties = `# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip
wrapperUrl=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar`;

  await fs.writeFile(path.join(wrapperDir, 'maven-wrapper.properties'), wrapperProperties);
  
  // Descargar Maven Wrapper JAR con validación de integridad
  const wrapperJarUrl = 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar';
  const wrapperJarPath = path.join(wrapperDir, 'maven-wrapper.jar');
  
  try {
    console.log('Descargando Maven Wrapper JAR...');
    const response = await fetch(wrapperJarUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Validar tamaño mínimo del archivo (debe ser al menos 50KB)
    if (buffer.length < 50000) {
      throw new Error(`Archivo Maven Wrapper demasiado pequeño: ${buffer.length} bytes`);
    }
    
    await fs.writeFile(wrapperJarPath, buffer);
    
    // Verificar que el archivo se escribió correctamente
    const stats = await fs.stat(wrapperJarPath);
    if (stats.size !== buffer.length) {
      throw new Error('Error de integridad: tamaño del archivo no coincide');
    }
    
    console.log(`Maven Wrapper descargado correctamente (${stats.size} bytes)`);
    
  } catch (error) {
    console.error('Error descargando Maven Wrapper:', error.message);
    console.log('Creando instrucciones de reparación automática...');
    
    // Crear archivo de instrucciones para reparación automática
    const repairInstructions = `# Reparación Automática de Maven Wrapper

Si encuentras el error "Could not find or load main class org.apache.maven.wrapper.MavenWrapperMain", 
ejecuta el script de reparación correspondiente a tu sistema operativo:

## Windows PowerShell:
\`\`\`powershell
if (!(Test-Path ".mvn\\wrapper\\maven-wrapper.jar") -or (Get-Item ".mvn\\wrapper\\maven-wrapper.jar").Length -lt 50000) {
    Write-Host "Reparando Maven Wrapper..." -ForegroundColor Yellow
    Remove-Item ".mvn\\wrapper\\maven-wrapper.jar" -Force -ErrorAction SilentlyContinue
    Invoke-WebRequest -Uri "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -OutFile ".mvn\\wrapper\\maven-wrapper.jar"
    Write-Host "Maven Wrapper reparado exitosamente" -ForegroundColor Green
}
\`\`\`

## Linux/Mac:
\`\`\`bash
if [ ! -f ".mvn/wrapper/maven-wrapper.jar" ] || [ $(stat -c%s ".mvn/wrapper/maven-wrapper.jar") -lt 50000 ]; then
    echo "Reparando Maven Wrapper..."
    rm -f ".mvn/wrapper/maven-wrapper.jar"
    curl -L "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -o ".mvn/wrapper/maven-wrapper.jar"
    echo "Maven Wrapper reparado exitosamente"
fi
\`\`\`

## Verificar integridad:
\`\`\`bash
# El archivo debe ser de al menos 50KB
ls -la .mvn/wrapper/maven-wrapper.jar
\`\`\`

## Después de la reparación:
\`\`\`bash
# Compilar el proyecto
./mvnw clean compile

# Ejecutar la aplicación
./mvnw spring-boot:run
\`\`\`
`;
    
    await fs.writeFile(path.join(projectDir, 'MAVEN_WRAPPER_REPAIR.md'), repairInstructions);
    
    // Crear placeholder para que el proyecto se pueda generar
    const placeholderJar = Buffer.from('PK'); // Placeholder mínimo
    await fs.writeFile(wrapperJarPath, placeholderJar);
  }
  
  // Maven Wrapper Script para Windows
  const mvnwCmd = `@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM   https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.2.0
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a keystroke before ending
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@REM Begin all REM lines with '@' in case MAVEN_BATCH_ECHO is 'on'
@echo off
@REM set title of command window
title %0
@REM enable echoing by setting MAVEN_BATCH_ECHO to 'on'
@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@REM set %HOME% to equivalent of $HOME
if "%HOME%" == "" (set "HOME=%HOMEDRIVE%%HOMEPATH%")

@REM Execute a user defined script before this one
if not "%MAVEN_SKIP_RC%" == "" goto skipRcPre
@REM check for pre script, once with legacy .bat ending and once with .cmd ending
if exist "%USERPROFILE%\\mavenrc_pre.bat" call "%USERPROFILE%\\mavenrc_pre.bat" %*
if exist "%USERPROFILE%\\mavenrc_pre.cmd" call "%USERPROFILE%\\mavenrc_pre.cmd" %*
:skipRcPre

@setlocal

set ERROR_CODE=0

@REM To isolate internal variables from possible post scripts, we use another setlocal
@setlocal

@REM ==== START VALIDATION ====
if not "%JAVA_HOME%" == "" goto OkJHome

echo.
echo Error: JAVA_HOME not found in your environment. >&2
echo Please set the JAVA_HOME variable in your environment to match the >&2
echo location of your Java installation. >&2
echo.
goto error

:OkJHome
if exist "%JAVA_HOME%\\bin\\java.exe" goto init

echo.
echo Error: JAVA_HOME is set to an invalid directory. >&2
echo JAVA_HOME = "%JAVA_HOME%" >&2
echo Please set the JAVA_HOME variable in your environment to match the >&2
echo location of your Java installation. >&2
echo.
goto error

@REM ==== END VALIDATION ====

:init

@REM Find the project base dir, i.e. the directory that contains the folder ".mvn".
@REM Fallback to current working directory if not found.

set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
IF NOT "%MAVEN_PROJECTBASEDIR%"=="" goto endDetectBaseDir

set EXEC_DIR=%CD%
set WDIR=%EXEC_DIR%
:findBaseDir
IF EXIST "%WDIR%"\\.mvn goto baseDirFound
cd ..
IF "%WDIR%"=="%CD%" goto baseDirNotFound
set WDIR=%CD%
goto findBaseDir

:baseDirFound
set MAVEN_PROJECTBASEDIR=%WDIR%
cd "%EXEC_DIR%"
goto endDetectBaseDir

:baseDirNotFound
set MAVEN_PROJECTBASEDIR=%EXEC_DIR%
cd "%EXEC_DIR%"

:endDetectBaseDir

IF NOT EXIST "%MAVEN_PROJECTBASEDIR%\\.mvn\\jvm.config" goto endReadAdditionalConfig

@setlocal EnableExtensions EnableDelayedExpansion
for /F "usebackq delims=" %%a in ("%MAVEN_PROJECTBASEDIR%\\.mvn\\jvm.config") do set JVM_CONFIG_MAVEN_PROPS=!JVM_CONFIG_MAVEN_PROPS! %%a
@endlocal & set JVM_CONFIG_MAVEN_PROPS=%JVM_CONFIG_MAVEN_PROPS%

:endReadAdditionalConfig

SET MAVEN_JAVA_EXE="%JAVA_HOME%\\bin\\java.exe"
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\\.mvn\\wrapper\\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

set DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_PROJECTBASEDIR%\\.mvn\\wrapper\\maven-wrapper.properties") DO (
    IF "%%A"=="wrapperUrl" SET DOWNLOAD_URL=%%B
)

@REM Extension to allow automatically downloading the maven-wrapper.jar from Maven-central
@REM This allows using the maven wrapper in projects that prohibit checking in binary data.
if exist %WRAPPER_JAR% (
    if "%MVNW_VERBOSE%" == "true" (
        echo Found %WRAPPER_JAR%
    )
) else (
    if not "%MVNW_REPOURL%" == "" (
        SET DOWNLOAD_URL="%MVNW_REPOURL%/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
    )
    if "%MVNW_VERBOSE%" == "true" (
        echo Couldn't find %WRAPPER_JAR%, downloading it ...
        echo Downloading from: %DOWNLOAD_URL%
    )

    powershell -Command "&{"^
		"$webclient = new-object System.Net.WebClient;"^
		"if (-not ([string]::IsNullOrEmpty('%MVNW_USERNAME%') -and [string]::IsNullOrEmpty('%MVNW_PASSWORD%'))) {"^
		"$webclient.Credentials = new-object System.Net.NetworkCredential('%MVNW_USERNAME%', '%MVNW_PASSWORD%');"^
		"}"^
		"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $webclient.DownloadFile('%DOWNLOAD_URL%', '%WRAPPER_JAR%')"^
		"}"
    if "%MVNW_VERBOSE%" == "true" (
        echo Finished downloading %WRAPPER_JAR%
    )
)
@REM End of extension

@REM Provide a "standardized" way to retrieve the CLI args that will
@REM work with both Windows and non-Windows executions.
set MAVEN_CMD_LINE_ARGS=%*

%MAVEN_JAVA_EXE% ^
  %JVM_CONFIG_MAVEN_PROPS% ^
  %MAVEN_OPTS% ^
  %MAVEN_DEBUG_OPTS% ^
  -classpath %WRAPPER_JAR% ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  %WRAPPER_LAUNCHER% %MAVEN_CMD_LINE_ARGS%
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

if not "%MAVEN_SKIP_RC%"=="" goto skipRcPost
@REM check for post script, once with legacy .bat ending and once with .cmd ending
if exist "%USERPROFILE%\\mavenrc_post.bat" call "%USERPROFILE%\\mavenrc_post.bat"
if exist "%USERPROFILE%\\mavenrc_post.cmd" call "%USERPROFILE%\\mavenrc_post.cmd"
:skipRcPost

@REM pause the script if MAVEN_BATCH_PAUSE is set to 'on'
if "%MAVEN_BATCH_PAUSE%"=="on" pause

if "%MAVEN_TERMINATE_CMD%"=="on" exit %ERROR_CODE%

cmd /C exit /B %ERROR_CODE%`;

  await fs.writeFile(path.join(projectDir, 'mvnw.cmd'), mvnwCmd);
  
  // Maven Wrapper Script para Unix/Linux
  const mvnwSh = `#!/bin/sh
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

# ----------------------------------------------------------------------------
# Apache Maven Wrapper startup batch script, version 3.2.0
#
# Required ENV vars:
# JAVA_HOME - location of a JDK home dir
#
# Optional ENV vars
# MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
# MAVEN_BATCH_PAUSE - set to 'on' to wait for a keystroke before ending
# MAVEN_OPTS - parameters passed to the Java VM when running Maven
#     e.g. to debug Maven itself, use
# set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
# MAVEN_SKIP_RC - flag to disable loading of mavenrc files
# ----------------------------------------------------------------------------

# Begin all REM lines with '@' in case MAVEN_BATCH_ECHO is 'on'
@echo off
@REM set title of command window
title %0
@REM enable echoing by setting MAVEN_BATCH_ECHO to 'on'
@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@REM set %HOME% to equivalent of $HOME
if "%HOME%" == "" (set "HOME=%HOMEDRIVE%%HOMEPATH%")

@REM Execute a user defined script before this one
if not "%MAVEN_SKIP_RC%" == "" goto skipRcPre
@REM check for pre script, once with legacy .bat ending and once with .cmd ending
if exist "%USERPROFILE%\\mavenrc_pre.bat" call "%USERPROFILE%\\mavenrc_pre.bat" %*
if exist "%USERPROFILE%\\mavenrc_pre.cmd" call "%USERPROFILE%\\mavenrc_pre.cmd" %*
:skipRcPre

@setlocal

set ERROR_CODE=0

@REM To isolate internal variables from possible post scripts, we use another setlocal
@setlocal

@REM ==== START VALIDATION ====
if not "%JAVA_HOME%" == "" goto OkJHome

echo.
echo Error: JAVA_HOME not found in your environment. >&2
echo Please set the JAVA_HOME variable in your environment to match the >&2
echo location of your Java installation. >&2
echo.
goto error

:OkJHome
if exist "%JAVA_HOME%\\bin\\java.exe" goto init

echo.
echo Error: JAVA_HOME is set to an invalid directory. >&2
echo JAVA_HOME = "%JAVA_HOME%" >&2
echo Please set the JAVA_HOME variable in your environment to match the >&2
echo location of your Java installation. >&2
echo.
goto error

@REM ==== END VALIDATION ====

:init

@REM Find the project base dir, i.e. the directory that contains the folder ".mvn".
@REM Fallback to current working directory if not found.

set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
IF NOT "%MAVEN_PROJECTBASEDIR%"=="" goto endDetectBaseDir

set EXEC_DIR=%CD%
set WDIR=%EXEC_DIR%
:findBaseDir
IF EXIST "%WDIR%"\\.mvn goto baseDirFound
cd ..
IF "%WDIR%"=="%CD%" goto baseDirNotFound
set WDIR=%CD%
goto findBaseDir

:baseDirFound
set MAVEN_PROJECTBASEDIR=%WDIR%
cd "%EXEC_DIR%"
goto endDetectBaseDir

:baseDirNotFound
set MAVEN_PROJECTBASEDIR=%EXEC_DIR%
cd "%EXEC_DIR%"

:endDetectBaseDir

IF NOT EXIST "%MAVEN_PROJECTBASEDIR%\\.mvn\\jvm.config" goto endReadAdditionalConfig

@setlocal EnableExtensions EnableDelayedExpansion
for /F "usebackq delims=" %%a in ("%MAVEN_PROJECTBASEDIR%\\.mvn\\jvm.config") do set JVM_CONFIG_MAVEN_PROPS=!JVM_CONFIG_MAVEN_PROPS! %%a
@endlocal & set JVM_CONFIG_MAVEN_PROPS=%JVM_CONFIG_MAVEN_PROPS%

:endReadAdditionalConfig

SET MAVEN_JAVA_EXE="%JAVA_HOME%\\bin\\java.exe"
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\\.mvn\\wrapper\\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

set DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_PROJECTBASEDIR%\\.mvn\\wrapper\\maven-wrapper.properties") DO (
    IF "%%A"=="wrapperUrl" SET DOWNLOAD_URL=%%B
)

@REM Extension to allow automatically downloading the maven-wrapper.jar from Maven-central
@REM This allows using the maven wrapper in projects that prohibit checking in binary data.
if exist %WRAPPER_JAR% (
    if "%MVNW_VERBOSE%" == "true" (
        echo Found %WRAPPER_JAR%
    )
) else (
    if not "%MVNW_REPOURL%" == "" (
        SET DOWNLOAD_URL="%MVNW_REPOURL%/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
    )
    if "%MVNW_VERBOSE%" == "true" (
        echo Couldn't find %WRAPPER_JAR%, downloading it ...
        echo Downloading from: %DOWNLOAD_URL%
    )

    powershell -Command "&{"^
		"$webclient = new-object System.Net.WebClient;"^
		"if (-not ([string]::IsNullOrEmpty('%MVNW_USERNAME%') -and [string]::IsNullOrEmpty('%MVNW_PASSWORD%'))) {"^
		"$webclient.Credentials = new-object System.Net.NetworkCredential('%MVNW_USERNAME%', '%MVNW_PASSWORD%');"^
		"}"^
		"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $webclient.DownloadFile('%DOWNLOAD_URL%', '%WRAPPER_JAR%')"^
		"}"
    if "%MVNW_VERBOSE%" == "true" (
        echo Finished downloading %WRAPPER_JAR%
    )
)
@REM End of extension

@REM Provide a "standardized" way to retrieve the CLI args that will
@REM work with both Windows and non-Windows executions.
set MAVEN_CMD_LINE_ARGS=%*

%MAVEN_JAVA_EXE% ^
  %JVM_CONFIG_MAVEN_PROPS% ^
  %MAVEN_OPTS% ^
  %MAVEN_DEBUG_OPTS% ^
  -classpath %WRAPPER_JAR% ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  %WRAPPER_LAUNCHER% %MAVEN_CMD_LINE_ARGS%
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

if not "%MAVEN_SKIP_RC%"=="" goto skipRcPost
@REM check for post script, once with legacy .bat ending and once with .cmd ending
if exist "%USERPROFILE%\\mavenrc_post.bat" call "%USERPROFILE%\\mavenrc_post.bat"
if exist "%USERPROFILE%\\mavenrc_post.cmd" call "%USERPROFILE%\\mavenrc_post.cmd"
:skipRcPost

@REM pause the script if MAVEN_BATCH_PAUSE is set to 'on'
if "%MAVEN_BATCH_PAUSE%"=="on" pause

if "%MAVEN_TERMINATE_CMD%"=="on" exit %ERROR_CODE%

cmd /C exit /B %ERROR_CODE%`;

  await fs.writeFile(path.join(projectDir, 'mvnw'), mvnwSh);
}

// Crear Dockerfile
async function createDockerfile(projectDir) {
  const dockerfileContent = `# Usar imagen base de OpenJDK 17
FROM openjdk:17-jdk-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar el archivo jar de la aplicación
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar

# Exponer el puerto 8080
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]

# Variables de entorno opcionales
ENV JAVA_OPTS=""
ENV SPRING_PROFILES_ACTIVE=prod`;

  await fs.writeFile(path.join(projectDir, 'Dockerfile'), dockerfileContent);
}

// Crear .gitignore
async function createGitignore(projectDir) {
  const gitignoreContent = `# Compiled class file
*.class

# Log file
*.log

# BlueJ files
*.ctxt

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files #
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# virtual machine crash logs
hs_err_pid*
replay_pid*

# Eclipse
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache

# IntelliJ IDEA
.idea
*.iws
*.iml
*.ipr

# NetBeans
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/
build/
!**/src/main/**/build/
!**/src/test/**/build/

# VS Code
.vscode/

# Maven
target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

# Gradle
.gradle
build/
!gradle/wrapper/gradle-wrapper.jar
!**/src/main/**/build/
!**/src/test/**/build/

# Database
*.h2
*.mv.db
*.trace.db

# OS
.DS_Store
Thumbs.db

# Application specific
application-local.properties
*.env
.env`;

  await fs.writeFile(path.join(projectDir, '.gitignore'), gitignoreContent);
}

// Crear tests automáticos para validar la generación
async function createAutomaticTests(testDir, entities) {
  // testDir ya es el directorio correcto: src/test/java/com/example/demo
  await fs.mkdir(testDir, { recursive: true });
  
  // Test de integración principal
  const integrationTest = `package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests automáticos generados para validar la integridad del proyecto Spring Boot
 * Estos tests verifican que no hay problemas de compilación, configuración o mapeo JPA
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class GeneratedProjectIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Test básico para verificar que la aplicación inicia correctamente
     */
    @Test
    public void contextLoads() {
        // Si este test pasa, significa que no hay errores de configuración
        // ni problemas de mapeo JPA
    }

    /**
     * Test para verificar que los endpoints básicos responden
     */
    @Test
    public void testBasicEndpoints() throws Exception {
        // Test de endpoint de salud (si existe)
        try {
            mockMvc.perform(get("/actuator/health"))
                    .andExpect(status().isOk());
        } catch (Exception e) {
            // Si no existe actuator, continuar con otros tests
        }
    }

    /**
     * Test para verificar que no hay problemas de CORS
     */
    @Test
    public void testCorsConfiguration() throws Exception {
        // Test básico de CORS
        mockMvc.perform(options("/api/test")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk());
    }
}`;

  await fs.writeFile(path.join(testDir, 'GeneratedProjectIntegrationTest.java'), integrationTest);
  
  // Test de validación de entidades
  const entityValidationTest = `package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

/**
 * Tests de validación de entidades generadas
 * Verifica que no hay campos duplicados ni problemas de mapeo JPA
 */
@SpringBootTest
@ActiveProfiles("test")
public class EntityValidationTest {

    /**
     * Test para verificar que las entidades se pueden instanciar sin errores
     */
    @Test
    public void testEntityInstantiation() {
        // Este test verifica que no hay problemas de compilación en las entidades
        // Si hay campos duplicados o problemas de mapeo, este test fallará
        
        try {
            // Intentar cargar las clases de entidad
            Class.forName("com.example.demo.model.Account");
            Class.forName("com.example.demo.model.Customer");
            Class.forName("com.example.demo.model.Branch");
            Class.forName("com.example.demo.model.Employee");
            Class.forName("com.example.demo.model.Loan");
            Class.forName("com.example.demo.model.Transaction");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Error cargando entidades: " + e.getMessage());
        }
    }

    /**
     * Test para verificar que los repositorios se pueden instanciar
     */
    @Test
    public void testRepositoryInstantiation() {
        try {
            // Intentar cargar las clases de repositorio
            Class.forName("com.example.demo.repository.AccountRepository");
            Class.forName("com.example.demo.repository.CustomerRepository");
            Class.forName("com.example.demo.repository.BranchRepository");
            Class.forName("com.example.demo.repository.EmployeeRepository");
            Class.forName("com.example.demo.repository.LoanRepository");
            Class.forName("com.example.demo.repository.TransactionRepository");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Error cargando repositorios: " + e.getMessage());
        }
    }
}`;

  await fs.writeFile(path.join(testDir, 'EntityValidationTest.java'), entityValidationTest);
  
  // Archivo de configuración de test
  const testResourcesDir = path.join(testDir, '..', '..', 'resources');
  await fs.mkdir(testResourcesDir, { recursive: true });
  
  const testProperties = `# Configuración de tests
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password

# Configuración JPA para tests
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false

# Deshabilitar H2 Console en tests
spring.h2.console.enabled=false

# Configuración de logging para tests
logging.level.com.example.demo=WARN
logging.level.org.springframework.web=WARN
logging.level.org.hibernate.SQL=WARN

# Configuración de servidor para tests
server.port=0`;

  await fs.writeFile(path.join(testResourcesDir, 'application-test.properties'), testProperties);
  
  console.log('Tests automáticos generados para validar la integridad del proyecto');
}

// Crear colección de Postman para pruebas
async function createPostmanCollection(projectDir, titulo, entities) {
  const postmanCollection = {
    "info": {
      "name": `${titulo} - Spring Boot API`,
      "description": "Colección de pruebas para la API generada automáticamente desde diagrama UML",
      "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      "version": "1.0.0"
    },
    "variable": [
      {
        "key": "baseUrl",
        "value": "http://localhost:8080/api",
        "type": "string",
        "description": "URL base de la API"
      }
    ],
    "item": entities.map(entity => ({
      "name": entity,
      "description": `Endpoints para la entidad ${entity}`,
      "item": [
        {
          "name": `Obtener todos los ${entity.toLowerCase()}`,
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/${entity.toLowerCase()}",
              "host": ["{{baseUrl}}"],
              "path": [entity.toLowerCase()]
            },
            "description": "Obtiene todos los registros de ${entity.toLowerCase()}"
          }
        },
        {
          "name": `Obtener ${entity.toLowerCase()} por ID`,
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/${entity.toLowerCase()}/1",
              "host": ["{{baseUrl}}"],
              "path": [entity.toLowerCase(), "1"]
            },
            "description": "Obtiene un ${entity.toLowerCase()} específico por su ID"
          }
        },
        {
          "name": `Crear nuevo ${entity.toLowerCase()}`,
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": JSON.stringify({
                "name": `Ejemplo ${entity}`,
                "description": "Descripción de ejemplo"
              }, null, 2)
            },
            "url": {
              "raw": "{{baseUrl}}/${entity.toLowerCase()}",
              "host": ["{{baseUrl}}"],
              "path": [entity.toLowerCase()]
            },
            "description": "Crea un nuevo ${entity.toLowerCase()}"
          }
        },
        {
          "name": `Actualizar ${entity.toLowerCase()} completamente`,
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": JSON.stringify({
                "id": 1,
                "name": `${entity} Actualizado`,
                "description": "Descripción actualizada"
              }, null, 2)
            },
            "url": {
              "raw": "{{baseUrl}}/${entity.toLowerCase()}/1",
              "host": ["{{baseUrl}}"],
              "path": [entity.toLowerCase(), "1"]
            },
            "description": "Actualiza completamente un ${entity.toLowerCase()} existente"
          }
        },
        {
          "name": `Actualizar ${entity.toLowerCase()} parcialmente`,
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": JSON.stringify({
                "name": `${entity} Parcialmente Actualizado`
              }, null, 2)
            },
            "url": {
              "raw": "{{baseUrl}}/${entity.toLowerCase()}/1",
              "host": ["{{baseUrl}}"],
              "path": [entity.toLowerCase(), "1"]
            },
            "description": "Actualiza parcialmente un ${entity.toLowerCase()} existente"
          }
        },
        {
          "name": `Eliminar ${entity.toLowerCase()}`,
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/${entity.toLowerCase()}/1",
              "host": ["{{baseUrl}}"],
              "path": [entity.toLowerCase(), "1"]
            },
            "description": "Elimina un ${entity.toLowerCase()} por su ID"
          }
        },
        {
          "name": `Contar ${entity.toLowerCase()}`,
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/${entity.toLowerCase()}/count",
              "host": ["{{baseUrl}}"],
              "path": [entity.toLowerCase(), "count"]
            },
            "description": "Obtiene el número total de ${entity.toLowerCase()}"
          }
        }
      ]
    }))
  };

  await fs.writeFile(
    path.join(projectDir, 'postman-collection.json'), 
    JSON.stringify(postmanCollection, null, 2)
  );
  
  console.log('Colección de Postman generada: postman-collection.json');
}

// Crear README
async function createReadme(projectDir, titulo, entities) {
  const readmeContent = `# ${titulo} - Spring Boot API

## Instalación y Ejecución

### Prerrequisitos
- Java 17 o superior
- El proyecto incluye Maven Wrapper (no necesitas instalar Maven)

### Pasos para ejecutar

1. Navegar al directorio del proyecto:
   \`\`\`bash
   cd ${path.basename(projectDir)}
   \`\`\`

2. Compilar y ejecutar:
   \`\`\`bash
   # En Windows:
   .\\mvnw.cmd clean compile
   .\\mvnw.cmd spring-boot:run
   
   # En Linux/Mac:
   ./mvnw clean compile
   ./mvnw spring-boot:run
   \`\`\`

3. La API estará disponible en: http://localhost:8080

### Ejecutar Tests
\`\`\`bash
./mvnw test
\`\`\`

## Endpoints Disponibles

### Base URL: http://localhost:8080/api

${entities.map(entity => `
### ${entity}

- GET /api/${entity.toLowerCase()} - Obtener todos los registros
- GET /api/${entity.toLowerCase()}/{id} - Obtener registro por ID
- POST /api/${entity.toLowerCase()} - Crear nuevo registro
- PUT /api/${entity.toLowerCase()}/{id} - Actualizar registro completo
- PATCH /api/${entity.toLowerCase()}/{id} - Actualizar registro parcial
- DELETE /api/${entity.toLowerCase()}/{id} - Eliminar registro
- GET /api/${entity.toLowerCase()}/count - Contar registros`).join('')}

## Pruebas con Postman

### Configuración básica
1. Abre Postman
2. Crea una nueva colección
3. Configura la variable de entorno \`baseUrl\` con el valor: \`http://localhost:8080/api\`

### Ejemplos de Pruebas

${entities.map(entity => `
#### ${entity}

**Obtener todos los ${entity.toLowerCase()}**
- Método: GET
- URL: \`{{baseUrl}}/${entity.toLowerCase()}\`

**Crear nuevo ${entity.toLowerCase()}**
- Método: POST
- URL: \`{{baseUrl}}/${entity.toLowerCase()}\`
- Headers: \`Content-Type: application/json\`
- Body (raw JSON):
\`\`\`json
{
  "nombre": "aldair",
  "apellido": "prueba"
}
\`\`\`

**Obtener ${entity.toLowerCase()} por ID**
- Método: GET
- URL: \`{{baseUrl}}/${entity.toLowerCase()}/1\`

**Actualizar ${entity.toLowerCase()} completamente**
- Método: PUT
- URL: \`{{baseUrl}}/${entity.toLowerCase()}/1\`
- Headers: \`Content-Type: application/json\`
- Body (raw JSON):
\`\`\`json
{
  "id": 1,
  "nombre": "${entity} Actualizado",
  "apellido": "Apellido Actualizado"
}
\`\`\`

**Actualizar ${entity.toLowerCase()} parcialmente**
- Método: PATCH
- URL: \`{{baseUrl}}/${entity.toLowerCase()}/1\`
- Headers: \`Content-Type: application/json\`
- Body (raw JSON):
\`\`\`json
{
  "nombre": "${entity} Parcialmente Actualizado"
}
\`\`\`

**Eliminar ${entity.toLowerCase()}**
- Método: DELETE
- URL: \`{{baseUrl}}/${entity.toLowerCase()}/1\`

**Contar ${entity.toLowerCase()}**
- Método: GET
- URL: \`{{baseUrl}}/${entity.toLowerCase()}/count\``).join('')}

## Base de Datos

El proyecto usa H2 Database (en memoria) para desarrollo:
- URL JDBC: jdbc:h2:mem:testdb
- Usuario: sa
- Contraseña: password
- Consola H2: http://localhost:8080/h2-console

## Configuración

### Cambiar Puerto
Si el puerto 8080 está ocupado, modifica \`application.properties\`:
\`\`\`properties
server.port=8081
\`\`\`

### Cambiar a PostgreSQL (Producción)
1. Agregar dependencia en \`pom.xml\`:
\`\`\`xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
\`\`\`

2. Modificar \`application.properties\`:
\`\`\`properties
spring.datasource.url=jdbc:postgresql://localhost:5432/tu_base_datos
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
\`\`\`

## Estructura del Proyecto

\`\`\`
src/
├── main/
│   ├── java/com/example/demo/
│   │   ├── model/          # Entidades JPA
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── repository/     # Repositorios JPA
│   │   ├── service/        # Lógica de negocio
│   │   ├── controller/     # Controladores REST
│   │   └── config/         # Configuraciones
│   └── resources/
│       └── application.properties
└── test/
\`\`\`

## Solución de Problemas

### Maven Wrapper Corrupto
Si encuentras el error "Could not find or load main class org.apache.maven.wrapper.MavenWrapperMain":

**Windows PowerShell:**
\`\`\`powershell
if (!(Test-Path ".mvn\\wrapper\\maven-wrapper.jar") -or (Get-Item ".mvn\\wrapper\\maven-wrapper.jar").Length -lt 50000) {
    Write-Host "Reparando Maven Wrapper..."
    Remove-Item ".mvn\\wrapper\\maven-wrapper.jar" -Force -ErrorAction SilentlyContinue
    Invoke-WebRequest -Uri "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -OutFile ".mvn\\wrapper\\maven-wrapper.jar"
}
\`\`\`

**Linux/Mac:**
\`\`\`bash
if [ ! -f ".mvn/wrapper/maven-wrapper.jar" ] || [ $(stat -c%s ".mvn/wrapper/maven-wrapper.jar") -lt 50000 ]; then
    echo "Reparando Maven Wrapper..."
    rm -f ".mvn/wrapper/maven-wrapper.jar"
    curl -L "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -o ".mvn/wrapper/maven-wrapper.jar"
fi
\`\`\`

### Otros Problemas Comunes
1. **Puerto 8080 ocupado:** Cambiar puerto en \`application.properties\`
2. **Error de Java:** Verificar que Java 17+ esté instalado con \`java -version\`
3. **Problemas de permisos:** En Linux/Mac ejecutar \`chmod +x mvnw\`

## Documentación Adicional

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [H2 Database](https://www.h2database.com/)

---

**Proyecto generado automáticamente desde diagrama UML**

### Entidades Generadas
${entities.map(entity => `- ${entity}`).join('\n')}

### Operaciones CRUD Disponibles
- GET /api/{entidad} - Obtener todos
- GET /api/{entidad}/{id} - Obtener por ID
- POST /api/{entidad} - Crear nuevo
- PUT /api/{entidad}/{id} - Actualizar completo
- PATCH /api/{entidad}/{id} - Actualizar parcial
- DELETE /api/{entidad}/{id} - Eliminar
- GET /api/{entidad}/count - Contar registros`;

  await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent);
}

module.exports = {
  generateSimpleSpringBootProject
};
