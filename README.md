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

### Instalación Local

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
npm run dev
```

## Despliegue en DigitalOcean

### Configuración de Base de Datos PostgreSQL

1. **Crear Droplet en DigitalOcean**
   - Ubuntu 22.04 LTS
   - Mínimo 1GB RAM, 1 CPU
   - Habilitar IPv6 y monitoreo

2. **Crear Base de Datos PostgreSQL**
   - Ir a "Databases" en DigitalOcean
   - Crear cluster PostgreSQL
   - Configurar firewall para permitir conexiones desde tu droplet

3. **Configurar credenciales de base de datos**
   - Host: `db-postgresql-nyc3-xxxxx-do-user-xxxxx-0.m.db.ondigitalocean.com`
   - Puerto: `25060`
   - Usuario: `doadmin`
   - Contraseña: `AVNS_xxxxxxxxxxxxx`
   - Base de datos: `defaultdb`
   - SSL: Requerido

### Despliegue de la Aplicación

1. **Conectar al Droplet**
```bash
ssh root@tu-droplet-ip
```

2. **Instalar Node.js**
```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

3. **Clonar y configurar la aplicación**
```bash
# Clonar repositorio
git clone <tu-repositorio>
cd examenBack-sw1

# Instalar dependencias
npm install

# Configurar variables de entorno
nano .env
```

4. **Configurar archivo .env para producción**
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
DB_HOST=db-postgresql-nyc3-xxxxx-do-user-xxxxx-0.m.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=doadmin
DB_PASSWORD=AVNS_xxxxxxxxxxxxx
DB_SSL=true
```

5. **Ejecutar migraciones de base de datos**
```bash
# Ejecutar migraciones en producción
npx sequelize-cli db:migrate --env production

# Verificar estado de migraciones
npx sequelize-cli db:migrate:status --env production
```

6. **Configurar PM2 para gestión de procesos**
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo de configuración PM2
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'examenBack-sw1',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

7. **Iniciar aplicación con PM2**
```bash
# Iniciar aplicación
pm2 start ecosystem.config.js

# Configurar PM2 para iniciar automáticamente
pm2 startup
pm2 save

# Verificar estado
pm2 status
pm2 logs
```

8. **Configurar Nginx como proxy reverso**
```bash
# Instalar Nginx
apt install nginx -y

# Configurar sitio
nano /etc/nginx/sites-available/examenBack-sw1
```

**Configuración Nginx:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar sitio
ln -s /etc/nginx/sites-available/examenBack-sw1 /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

9. **Configurar SSL con Let's Encrypt**
```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
certbot --nginx -d tu-dominio.com

# Verificar renovación automática
certbot renew --dry-run
```

### Comandos de Gestión

```bash
# Ver logs de la aplicación
pm2 logs examenBack-sw1

# Reiniciar aplicación
pm2 restart examenBack-sw1

# Detener aplicación
pm2 stop examenBack-sw1

# Ver estado de la aplicación
pm2 status

# Monitorear recursos
pm2 monit
```

### Scripts de Despliegue

**deploy.sh:**
```bash
#!/bin/bash
echo "Iniciando despliegue..."

# Actualizar código
git pull origin main

# Instalar dependencias
npm install

# Ejecutar migraciones
npx sequelize-cli db:migrate --env production

# Reiniciar aplicación
pm2 restart examenBack-sw1

echo "Despliegue completado"
```

```bash
# Hacer ejecutable
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh
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