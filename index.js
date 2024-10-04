const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const invitationsRoutes = require('./routes/invitationsRoutes');
//const invitation = require('./routes/diagramas')
const diagramaRoutes = require('./routes/diagramaRoutes');
const { verificarToken } = require('./middleware/authMiddleware');
const socketIo = require('socket.io');
const http = require('http'); // Importar el módulo HTTP
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
// Crear el servidor HTTP a partir de la aplicación Express
const server = http.createServer(app);
// Configuración de CORS para Express
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Permite solicitudes solo desde tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Permite el envío de credenciales (cookies, headers de autenticación)
}));
app.use(express.json());







app.post('/api/generate-backend', async (req, res) => {
  const { diagramaJSON } = req.body;
  console.log('Diagrama JSON recibido:', diagramaJSON);

  try {
      // Asegúrate de que la función capitalize está definida
      function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
  
      // Generar el prompt que se enviará a OpenAI
      const prompt = `Eres un programador experto en Spring Boot. Te paso el siguiente archivo JSON que contiene la estructura de un diagrama de clases: ${JSON.stringify(diagramaJSON)}. Quiero que generes un backend completo en Spring Boot. Este backend debe tener las siguientes características:
  
      1. Genera las entidades JPA (modelos) basadas en las clases y sus atributos. Las claves primarias (PK) deben estar anotadas correctamente.
      2. Crea los repositorios JPA para cada entidad.
      3. Crea los servicios para manejar la lógica de negocio.
      4. Crea los controladores REST para manejar las solicitudes HTTP (GET, POST, PUT, DELETE).
      5. Asegúrate de que las relaciones entre las entidades estén bien representadas (asociaciones, composiciones, generalizaciones, muchos a muchos).
      6. Organiza el código en carpetas: 'models', 'repositories', 'services', y 'controllers'.
      7. Genera todo como un proyecto de Spring Boot completamente funcional que pueda descargarse como un archivo ZIP.
      8. Asegúrate de que el proyecto esté listo para conectarse a una base de datos PostgreSQL.
  
      Aquí está el JSON con la estructura del diagrama: ${JSON.stringify(diagramaJSON)};`;
  
      // Llamada a la API de OpenAI
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 5000,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const generatedCode = response.data.choices[0].message.content;
      // Crear la estructura del proyecto
    const projectPath = path.join(__dirname, 'spring-boot-backend');
    const srcPath = path.join(projectPath, 'src');
    const mainPath = path.join(srcPath, 'main');
    const resourcesPath = path.join(mainPath, 'resources');
    const javaPath = path.join(mainPath, 'java/com/example/demo');

    // Crear las carpetas necesarias
    fs.mkdirSync(javaPath, { recursive: true });

    // Función para capitalizar
    function capitalize(str) {
      if (typeof str !== 'string' || str.length === 0) {
        return '';
      }
      str = str.trim();
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Función para parsear atributos
    function parseAttribute(attrString) {
      let name = attrString;
      let type = 'String'; // Tipo por defecto
      let isPrimaryKey = false;

      // Detectar si es clave primaria
      if (attrString.includes('(PK)')) {
        isPrimaryKey = true;
        name = attrString.replace('(PK)', '').trim();
      }

      // Aquí podrías agregar lógica adicional para extraer el tipo si está incluido en el nombre
      // Por ejemplo, si el atributo es "edad: int", extraer el tipo "int"

      return { name, type, isPrimaryKey };
    }

    // Procesar dinámicamente las clases del diagrama JSON
    const classes = diagramaJSON.classes || [];
    const relations = diagramaJSON.relations || [];

    // Construir un mapa de clases por ID
    const classMap = {};
    classes.forEach(entity => {
      classMap[entity.id] = entity;
      entity.relations = []; // Inicializar el array de relaciones en cada entidad
    });

    // Procesar relaciones y agregarlas a las entidades correspondientes
    relations.forEach(relation => {
      const sourceEntity = classMap[relation.source];
      const targetEntity = classMap[relation.target];

      if (!sourceEntity || !targetEntity) {
        console.error('Relación inválida, entidades no encontradas:', relation);
        return;
      }

      sourceEntity.relations.push({
        type: relation.type,
        target: targetEntity.name.replace(/\s+/g, ''),
        multiplicidadOrigen: relation.multiplicidadOrigen,
        multiplicidadDestino: relation.multiplicidadDestino,
      });
    });

    classes.forEach((entity) => {
      const entityName = entity.name.replace(/\s+/g, '');

      // Crear carpeta para la entidad
      const entityPath = path.join(javaPath, entityName);
      fs.mkdirSync(entityPath, { recursive: true });

      // Crear subcarpetas: model, repository, service, controller
      const subfolders = ['model', 'repository', 'service', 'controller'];

      subfolders.forEach(subfolder => {
        const subfolderPath = path.join(entityPath, subfolder);
        fs.mkdirSync(subfolderPath, { recursive: true });
      });

      // Modelo (Entidad)
      const attributes = Array.isArray(entity.attributes) ? entity.attributes : [];
      const fields = attributes.map(attrString => {
        const { name, type, isPrimaryKey } = parseAttribute(attrString);
        return {
          name,
          type,
          isPrimaryKey,
        };
      });

      const fieldsDeclarations = fields.map(field => {
        if (field.isPrimaryKey) {
          return `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ${field.name};`;
        } else {
          return `private ${field.type} ${field.name};`;
        }
      }).join('\n    ');

      const gettersSetters = fields.map(field => `
    public ${field.type} get${capitalize(field.name)}() {
        return ${field.name};
    }

    public void set${capitalize(field.name)}(${field.type} ${field.name}) {
        this.${field.name} = ${field.name};
    }`).join('\n    ');

      // Procesar relaciones
      const relationsCode = (entity.relations || []).map(rel => {
        // Dependiendo del tipo de relación, agregamos las anotaciones correspondientes
        let relationAnnotation = '';
        let relationField = '';
        const targetEntityName = rel.target;

        if (rel.type === 'Asociación' || rel.type === 'Uno a Muchos') {
          relationAnnotation = `@OneToMany(mappedBy = "${entityName.toLowerCase()}")`;
          relationField = `private List<${targetEntityName}> ${targetEntityName.toLowerCase()}s = new ArrayList<>();`;
        } else if (rel.type === 'Muchos a Uno') {
          relationAnnotation = `@ManyToOne`;
          relationField = `private ${targetEntityName} ${targetEntityName.toLowerCase()};`;
        } else if (rel.type === 'Muchos a Muchos') {
          relationAnnotation = `@ManyToMany`;
          relationField = `private List<${targetEntityName}> ${targetEntityName.toLowerCase()}s = new ArrayList<>();`;
        } else if (rel.type === 'Composición') {
          relationAnnotation = `@OneToOne(cascade = CascadeType.ALL)`;
          relationField = `private ${targetEntityName} ${targetEntityName.toLowerCase()};`;
        } else if (rel.type === 'Generalización') {
          // Para generalización, usamos herencia
          return `// Hereda de ${targetEntityName}`;
        }

        return `
    ${relationAnnotation}
    ${relationField}
    `;
      }).join('\n    ');

      // Para generalización (herencia)
      let extendsClause = '';
      const generalization = (entity.relations || []).find(rel => rel.type === 'Generalización');
      if (generalization) {
        extendsClause = ` extends ${generalization.target}`;
      }

      const modelContent = `
package com.example.demo.${entityName}.model;

import javax.persistence.*;
import java.util.*;

@Entity
${generalization ? '@Inheritance(strategy = InheritanceType.JOINED)' : ''}
public class ${entityName}${extendsClause} {
    ${fieldsDeclarations}

    // Relaciones
    ${relationsCode}

    public ${entityName}() {}

    ${gettersSetters}
}
`;
      fs.writeFileSync(path.join(entityPath, 'model', `${entityName}.java`), modelContent);

      // Repositorio
      const repositoryContent = `
package com.example.demo.${entityName}.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.${entityName}.model.${entityName};

public interface ${entityName}Repository extends JpaRepository<${entityName}, Long> {
}
`;
      fs.writeFileSync(path.join(entityPath, 'repository', `${entityName}Repository.java`), repositoryContent);

      // Servicio
      const serviceContent = `
package com.example.demo.${entityName}.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.${entityName}.model.${entityName};
import com.example.demo.${entityName}.repository.${entityName}Repository;
import java.util.List;
import java.util.Optional;

@Service
public class ${entityName}Service {
    @Autowired
    private ${entityName}Repository repository;

    public List<${entityName}> findAll() {
        return repository.findAll();
    }

    public Optional<${entityName}> findById(Long id) {
        return repository.findById(id);
    }

    public ${entityName} save(${entityName} ${entityName.toLowerCase()}) {
        return repository.save(${entityName.toLowerCase()});
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
`;
      fs.writeFileSync(path.join(entityPath, 'service', `${entityName}Service.java`), serviceContent);

      // Controlador
      const controllerContent = `
package com.example.demo.${entityName}.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.${entityName}.model.${entityName};
import com.example.demo.${entityName}.service.${entityName}Service;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/${entityName.toLowerCase()}")
public class ${entityName}Controller {

    @Autowired
    private ${entityName}Service service;

    @GetMapping
    public List<${entityName}> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ${entityName} getById(@PathVariable Long id) {
        return service.findById(id).orElse(null);
    }

    @PostMapping
    public ${entityName} create(@RequestBody ${entityName} ${entityName.toLowerCase()}) {
        return service.save(${entityName.toLowerCase()});
    }

    @PutMapping("/{id}")
    public ${entityName} update(@PathVariable Long id, @RequestBody ${entityName} ${entityName.toLowerCase()}) {
        ${entityName.toLowerCase()}.setId(id);
        return service.save(${entityName.toLowerCase()});
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteById(id);
    }
}
`;
      fs.writeFileSync(path.join(entityPath, 'controller', `${entityName}Controller.java`), controllerContent);
    });

    // Crear la clase principal de la aplicación
    const applicationContent = `
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringBootBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringBootBackendApplication.class, args);
    }
}
`;
    fs.writeFileSync(path.join(javaPath, 'SpringBootBackendApplication.java'), applicationContent);

    // Crear el archivo pom.xml con dependencias PostgreSQL
    const pomContent = `
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>spring-boot-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>spring-boot-backend</name>
    <description>Spring Boot Backend</description>
    <packaging>jar</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.6.2</version>
        <relativePath/>
    </parent>

    <properties>
        <java.version>11</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starter Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Boot Starter Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- PostgreSQL Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Spring Boot Starter Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Spring Boot Maven Plugin -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`;
    fs.writeFileSync(path.join(projectPath, 'pom.xml'), pomContent);

    // Crear el archivo application.properties
    const propertiesContent = `
spring.datasource.url=jdbc:postgresql://localhost:5432/mi_base_de_datos
spring.datasource.username=mi_usuario
spring.datasource.password=mi_contraseña
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
`;
    fs.mkdirSync(resourcesPath, { recursive: true });
    fs.writeFileSync(path.join(resourcesPath, 'application.properties'), propertiesContent);

    // Generar el archivo ZIP
    const output = fs.createWriteStream(path.join(__dirname, 'spring-boot-backend.zip'));
    const archive = archiver('zip', {
      zlib: { level: 9 } // Nivel de compresión
    });

    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      res.download(path.join(__dirname, 'spring-boot-backend.zip')); // Envía el archivo ZIP al cliente
    });

    archive.on('error', function (err) {
      throw err;
    });

    // Añadir la carpeta del proyecto al archivo ZIP
    archive.directory(projectPath, false);

    // Finaliza el archivo ZIP
    archive.pipe(output);
    archive.finalize();
  } catch (error) {
    console.error('Error al generar el backend:', error);
    res.status(500).send('Error al generar el backend');
  }
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}



const io = socketIo(server,{
  cors:{
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods:['GET', 'POST'],
    credentials: true 
  }
});

// Manejo de sockets para colaboración en tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Únete a una sala específica basada en el ID del diagrama
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Usuario ${socket.id} se unió a la sala: ${roomId}`);
  });

  // Manejo de actualizaciones del diagrama
  socket.on('update-diagram', (data) => {
    const { roomId, diagram } = data;
    // Emitir el diagrama actualizado a todos los usuarios en la sala, excepto al que lo envió
    socket.to(roomId).emit('diagram-updated', diagram);
  });
  socket.on('move-class', (data) => {
    const { roomId, classId, position } = data;
    socket.to(roomId).emit('class-moved', { classId, position });
  });
   // Manejo de movimiento del mouse
   socket.on('mouse-move', (data) => {
    const { roomId, mouseX, mouseY } = data;
    socket.to(roomId).emit('mouse-moved', { mouseX, mouseY });
  });
   // Manejar agregar clase
   socket.on('add-class', (data) => {
    const { roomId, newClass } = data;
    socket.to(roomId).emit('class-added', { newClass });
  });

  // Manejar actualizar clase
  socket.on('update-class', (data) => {
    const { roomId, classId, updatedData } = data;
    socket.to(roomId).emit('class-updated', { classId, updatedData });
  });

  // Manejar eliminar clase
  socket.on('delete-class', (data) => {
    const { roomId, classId } = data;
    socket.to(roomId).emit('class-deleted', { classId });
  });
  // server.js
socket.on('add-relation', (data) => {
  const { roomId, newRelation } = data;
  socket.to(roomId).emit('relation-added', { newRelation });
});

socket.on('update-relation', (data) => {
  const { roomId, relationId, updatedData } = data;
  socket.to(roomId).emit('relation-updated', { relationId, updatedData });
});

socket.on('delete-relation', (data) => {
  const { roomId, relationId } = data;
  socket.to(roomId).emit('relation-deleted', { relationId });
});

  // Desconexión del usuario
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});



// Conectar a la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
  }
);

sequelize
  .authenticate()
  .then(() => console.log('Conectado a la base de datos'))
  .catch((err) => console.error('Error de conexión:', err));

// Ruta base
app.get('/', (req, res) => {
  res.send('API en funcionamiento');
});
// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de diagramas protegidas
app.use('/api/diagramas', verificarToken, diagramaRoutes);
app.use('/api/invitations', invitationsRoutes);
// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
