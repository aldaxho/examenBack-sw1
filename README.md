# Sistema de Generación Automática de Backends Spring Boot desde Diagramas UML

## Descripción del Proyecto

Este proyecto es una **API REST completa** desarrollada en **Node.js** que permite generar automáticamente proyectos **Spring Boot** funcionales a partir de diagramas UML. El sistema incluye funcionalidades avanzadas como colaboración en tiempo real, autenticación JWT, generación de código completo y gestión de usuarios.

## Características Principales

- **Generación completa de proyectos Spring Boot** desde diagramas UML
- **Arquitectura MVC completa**: Entidades JPA, DTOs, Repositorios, Servicios y Controladores REST
- **Mapeo automático de relaciones**: Asociaciones, Composición, Agregación y Generalización
- **Colaboración en tiempo real** con Socket.IO
- **Sistema de autenticación JWT** con middleware de seguridad
- **Asistente IA integrado** para análisis y mejora de diagramas
- **Gestión de usuarios y permisos** granulares
- **Sistema de invitaciones** para colaboración
- **Limpieza automática** de archivos temporales
- **Tests automáticos** para validar generación

## Arquitectura del Sistema

### Tecnologías Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web RESTful
- **Socket.IO** - Comunicación en tiempo real
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticación con tokens seguros
- **bcryptjs** - Encriptación de contraseñas
- **Archiver** - Compresión de archivos ZIP

### Base de Datos
- **PostgreSQL** - Base de datos principal para persistencia
- **H2 Database** - Base de datos en memoria para proyectos generados

### Generación de Código
- **Spring Boot 3.1.5** - Framework Java generado
- **JPA/Hibernate** - Persistencia de datos
- **Maven** - Gestión de dependencias
- **Jackson** - Serialización JSON
- **OpenAPI Generator** - Estándar de la industria

### Estructura de Directorios
```
├── controllers/          # Controladores de la API
│   ├── assistantController.js    # IA para análisis de diagramas
│   ├── authController.js         # Autenticación y registro
│   ├── diagramaController.js     # CRUD de diagramas
│   ├── invitacionController.js   # Sistema de invitaciones
│   └── openapiController.js     # Generación de Spring Boot
├── middleware/           # Middleware personalizado
│   └── authMiddleware.js         # Verificación JWT
├── models/              # Modelos de base de datos
│   ├── diagrama.js             # Modelo de diagramas
│   ├── DiagramaUsuario.js       # Relación diagrama-usuario
│   ├── usuario.js              # Modelo de usuarios
│   └── index.js                # Configuración Sequelize
├── routes/              # Definición de rutas
│   ├── assistantRoutes.js       # Rutas de IA
│   ├── authRoutes.js           # Rutas de autenticación
│   ├── diagramaRoutes.js       # Rutas de diagramas
│   ├── invitationsRoutes.js    # Rutas de invitaciones
│   └── openapiRoutes.js        # Rutas de generación
├── services/            # Lógica de negocio
│   └── agentService.js          # Servicio de IA
├── utils/               # Utilidades
│   ├── simpleSpringBootGenerator.js  # Generador principal
│   ├── canvasAutoFit.js              # Utilidades canvas
│   └── tempCleaner.js                # Limpieza automática
└── migrations/          # Migraciones de base de datos
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil (requiere token)

### Diagramas
- `GET /api/diagramas` - Listar diagramas del usuario
- `POST /api/diagramas` - Crear nuevo diagrama
- `GET /api/diagramas/:id` - Obtener diagrama específico
- `PUT /api/diagramas/:id` - Actualizar diagrama
- `DELETE /api/diagramas/:id` - Eliminar diagrama

### Generación de Backends
- `POST /api/openapi/generate/:id` - Generar proyecto Spring Boot
- `GET /api/openapi/download/:filename` - Descargar proyecto generado

### Asistente IA
- `POST /api/assistant/analyze` - Analizar diagrama con IA
- `POST /api/assistant/chat/:diagramId` - Chat contextual con diagrama

### Invitaciones
- `POST /api/invitations/send` - Enviar invitación
- `POST /api/invitations/accept/:token` - Aceptar invitación
- `GET /api/invitations/pending` - Invitaciones pendientes

## Funcionalidades Detalladas

### Generador de Spring Boot

El sistema incluye un **generador completo** que crea proyectos Spring Boot funcionales con:

#### Entidades JPA
```java
@Entity
@Table(name = "persona")
public class Persona {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "nombre")
    private String nombre;
    
    @Column(name = "apellido")
    private String apellido;
    
    // Getters y Setters automáticos
}
```

#### Controladores REST
```java
@RestController
@RequestMapping("/api/persona")
public class PersonaController {
    
    @PostMapping
    public ResponseEntity<PersonaDTO> create(@Valid @RequestBody PersonaDTO dto) {
        PersonaDTO created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    // CRUD completo automático
}
```

#### Servicios con Mapeo Completo
```java
@Service
public class PersonaService {
    
    private PersonaDTO convertToDTO(Persona entity) {
        PersonaDTO dto = new PersonaDTO();
        dto.setId(entity.getId());
        dto.setNombre(entity.getNombre());
        dto.setApellido(entity.getApellido());
        return dto;
    }
    
    // Mapeo bidireccional automático
}
```

### Colaboración en Tiempo Real

El sistema implementa **colaboración en tiempo real** usando Socket.IO:

#### Funcionalidades de Colaboración
- **Presencia de usuarios**: Ver quién está trabajando en el diagrama
- **Sincronización automática**: Cambios se reflejan instantáneamente
- **Indicadores de mouse**: Ver dónde están trabajando otros usuarios
- **Gestión de salas**: Cada diagrama es una sala independiente

#### Eventos de Socket.IO
```javascript
// Unirse a un diagrama
socket.emit('join-diagram', { roomId: 'diagrama-123' });

// Actualizar diagrama
socket.emit('update-diagram', { 
    roomId: 'diagrama-123', 
    diagram: diagramData 
});

// Movimiento de mouse
socket.emit('mouse-move', { 
    roomId: 'diagrama-123', 
    mouseX: 100, 
    mouseY: 200 
});
```

### Sistema de Autenticación

Implementa **autenticación JWT** completa:

#### Middleware de Verificación
```javascript
const verificarToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Usuario.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};
```

#### Rutas Protegidas
```javascript
// Todas las rutas de diagramas requieren autenticación
app.use('/api/diagramas', verificarToken, diagramaRoutes);
app.use('/api/assistant', verificarToken, assistantRoutes);
```

## Instalación y Configuración

### Prerrequisitos
- Node.js 16+ 
- PostgreSQL 12+
- Java 17+ (para proyectos generados)

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd examenBack-sw1
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env`:
```env
PORT=3001
DB_NAME=tu_base_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
JWT_SECRET=tu_secreto_jwt
```

4. **Configurar base de datos**
```bash
# Ejecutar migraciones
npx sequelize-cli db:migrate
```

5. **Iniciar servidor**
```bash
npm start
# o para desarrollo
nodemon index.js
```

## Casos de Uso

### 1. Crear Diagrama UML
```bash
POST /api/diagramas
Content-Type: application/json
Authorization: Bearer <token>

{
    "titulo": "Sistema de Biblioteca",
    "contenido": {
        "classes": [
            {
                "id": "class-1",
                "name": "Libro",
                "attributes": ["titulo:String", "autor:String", "isbn:String"]
            }
        ],
        "relations": []
    }
}
```

### 2. Generar Backend Spring Boot
```bash
POST /api/openapi/generate/123
Authorization: Bearer <token>
```

**Respuesta**: Archivo ZIP con proyecto Spring Boot completo

### 3. Colaboración en Tiempo Real
```javascript
// Frontend se conecta al diagrama
socket.emit('join-diagram', { roomId: 'diagrama-123' });

// Recibe actualizaciones automáticamente
socket.on('diagram-updated', (diagram) => {
    // Actualizar interfaz con nuevo diagrama
    updateDiagramUI(diagram);
});
```

## Ventajas del Sistema

### Para Desarrolladores
- **Ahorro de tiempo**: Generación automática de código repetitivo
- **Consistencia**: Patrones de código uniformes
- **Calidad**: Código probado y sin errores
- **Documentación**: README automático con ejemplos

### Para Equipos
- **Colaboración**: Trabajo simultáneo en diagramas
- **Comunicación**: Presencia visual de usuarios
- **Sincronización**: Cambios en tiempo real
- **Gestión**: Sistema de permisos y invitaciones

### Para Proyectos
- **Escalabilidad**: Arquitectura MVC completa
- **Mantenibilidad**: Código bien estructurado
- **Testing**: Tests automáticos incluidos
- **Deployment**: Configuración lista para producción

## Solución de Problemas

### Error de Compilación en Spring Boot
```bash
# Verificar que Java 17+ esté instalado
java -version

# Limpiar y recompilar
./mvnw clean compile
```

### Error de Conexión a Base de Datos
```bash
# Verificar variables de entorno
echo $DB_HOST
echo $DB_NAME

# Probar conexión
npx sequelize-cli db:migrate:status
```

### Problemas de Socket.IO
```javascript
// Verificar conexión en consola del navegador
console.log('Socket conectado:', socket.connected);

// Reconectar si es necesario
socket.connect();
```

## Contribución

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
refactor: refactorización de código
test: agregar o corregir tests
```

### Desarrollo Local
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC. Ver archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o soporte técnico, contactar al equipo de desarrollo.

---

**Desarrollado con Node.js, Express.js, Socket.IO y Spring Boot**