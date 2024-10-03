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





app.post('/generate-backend', async (req, res) => {
  const { diagramaJSON } = req.body;
  console.log('Diagrama JSON recibido:', diagramaJSON);

  try {
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
      
      Aquí está el JSON con la estructura del diagrama: ${JSON.stringify(diagramaJSON)}`;

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

    // Crear las carpetas de estructura
    const folders = ['models', 'repositories', 'services', 'controllers'];

    folders.forEach(folder => {
      const folderPath = path.join(javaPath, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    });

    // Crear el archivo pom.xml con dependencias PostgreSQL
    const pomContent = `
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>spring-boot-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>
    <name>spring-boot-backend</name>
    <description>Demo project for Spring Boot</description>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.6.2</version>
        <relativePath />
    </parent>

    <properties>
        <java.version>11</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
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

    // Crear archivos para cada entidad (modelo, repositorio, servicio y controlador)
    const entities = ['Persona', 'Auto', 'AsociacionTaxis', 'ClaseIntermedia'];

    entities.forEach(entity => {
      // Modelos
      const modelContent = `
package com.example.demo.models;

import javax.persistence.*;

@Entity
public class ${entity} {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Agregar atributos según tu diagrama

    public ${entity}() {}
    // Getters y Setters
}
`;
      fs.writeFileSync(path.join(javaPath, 'models', `${entity}.java`), modelContent);

      // Repositorios
      const repositoryContent = `
package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.models.${entity};

public interface ${entity}Repository extends JpaRepository<${entity}, Long> {
}
`;
      fs.writeFileSync(path.join(javaPath, 'repositories', `${entity}Repository.java`), repositoryContent);

      // Servicios
      const serviceContent = `
package com.example.demo.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.repositories.${entity}Repository;
import java.util.List;

@Service
public class ${entity}Service {
    @Autowired
    private ${entity}Repository repository;

    public List<${entity}> findAll() {
        return repository.findAll();
    }

    // Otros métodos según sea necesario
}
`;
      fs.writeFileSync(path.join(javaPath, 'services', `${entity}Service.java`), serviceContent);

      // Controladores
      const controllerContent = `
package com.example.demo.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.services.${entity}Service;
import java.util.List;

@RestController
@RequestMapping("/api/${entity.toLowerCase()}")
public class ${entity}Controller {

    @Autowired
    private ${entity}Service service;

    @GetMapping
    public List<${entity}> getAll() {
        return service.findAll();
    }

    // Otros endpoints según sea necesario
}
`;
      fs.writeFileSync(path.join(javaPath, 'controllers', `${entity}Controller.java`), controllerContent);
    });

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
    console.error('Error al comunicarse con la API de OpenAI:', error);
    res.status(500).send('Error al obtener respuesta de OpenAI');
  }
});


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
