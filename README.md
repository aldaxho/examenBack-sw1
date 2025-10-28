# Sistema de Generación Automática Full-Stack desde Diagramas UML

## Descripción del Proyecto

Este proyecto es una **API REST completa** desarrollada en **Node.js** que permite generar automáticamente proyectos **Spring Boot** (backend) y **Flutter** (frontend móvil) funcionales a partir de diagramas UML. El sistema incluye funcionalidades avanzadas como colaboración en tiempo real, autenticación JWT, generación de código completo, gestión de usuarios y conexión automática entre backend y frontend.

## Características Principales

- **Generación completa de proyectos Spring Boot** desde diagramas UML
- **Generación completa de aplicaciones Flutter** para dispositivos móviles
- **Conexión automática** entre backend Spring Boot y frontend Flutter
- **Arquitectura MVC completa**: Entidades JPA, DTOs, Repositorios, Servicios y Controladores REST
- **Arquitectura Flutter completa**: Modelos, Servicios API, Pantallas, Widgets y Navegación
- **Mapeo automático de relaciones**: Asociaciones, Composición, Agregación y Generalización
- **CRUD completo en Flutter**: Lista, Formulario, Detalle para cada entidad
- **Colaboración en tiempo real** con Socket.IO
- **Sistema de autenticación JWT** con middleware de seguridad
- **Asistente IA integrado** para análisis y mejora de diagramas
- **Gestión de usuarios y permisos** granulares
- **Sistema de invitaciones** para colaboración
- **Limpieza automática** de archivos temporales
- **Tests automáticos** para validar generación
- **Scripts de ejecución** para proyectos completos

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
- **Flutter 3.10+** - Framework móvil generado
- **Dart 3.0+** - Lenguaje de programación Flutter
- **HTTP** - Comunicación con backend
- **JSON Annotation** - Serialización de datos
- **Provider** - Gestión de estado

### Estructura de Directorios
```
├── controllers/          # Controladores de la API
│   ├── assistantController.js    # IA para análisis de diagramas
│   ├── authController.js         # Autenticación y registro
│   ├── diagramaController.js     # CRUD de diagramas
│   ├── invitacionController.js   # Sistema de invitaciones
│   ├── openapiController.js     # Generación de Spring Boot
│   └── flutterController.js     # Generación de Flutter y Full-Stack
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
│   ├── simpleSpringBootGenerator.js  # Generador Spring Boot
│   ├── flutterGenerator.js           # Generador Flutter
│   ├── createHomeScreen.js           # Generador pantalla principal
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

### Generación de Proyectos
- `POST /api/openapi/generate-backend/:id` - Generar solo proyecto Spring Boot
- `POST /api/openapi/generate-flutter/:id` - Generar solo proyecto Flutter
- `POST /api/openapi/generate-fullstack/:id` - Generar proyecto completo (Backend + Frontend)
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

### Generador de Flutter

El sistema incluye un **generador completo** que crea aplicaciones Flutter funcionales con:

#### Modelos Dart
```dart
@JsonSerializable()
class Persona {
  final int? id;
  final String? nombre;
  final String? apellido;

  const Persona({
    this.id,
    this.nombre,
    this.apellido,
  });

  factory Persona.fromJson(Map<String, dynamic> json) => _$PersonaFromJson(json);
  Map<String, dynamic> toJson() => _$PersonaToJson(this);
}
```

#### Servicios API
```dart
class PersonaService {
  static Future<List<Persona>> getAll() async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/persona'),
      headers: {'Content-Type': 'application/json'},
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> jsonList = json.decode(response.body);
      return jsonList.map((json) => Persona.fromJson(json)).toList();
    } else {
      throw Exception('Error al obtener personas: ${response.statusCode}');
    }
  }
}
```

#### Pantallas de Gestión
```dart
class PersonaListScreen extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Personas')),
      body: ListView.builder(
        itemCount: _items.length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              title: Text(_items[index].toString()),
              onTap: () => _navigateToDetail(_items[index]),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _navigateToForm(),
        child: Icon(Icons.add),
      ),
    );
  }
}
```

#### Configuración de Conexión
```dart
class ApiConfig {
  static const String baseUrl = 'http://localhost:8080/api';
  static const Duration timeout = Duration(seconds: 30);
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
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
- Flutter 3.10+ (para proyectos móviles)
- Dart 3.0+ (incluido con Flutter)

### Instalación Local

1. **Clonar el repositorio**
```powershell
git clone <repository-url>
cd examenBack-sw1
```

2. **Instalar dependencias**
```powershell
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz del proyecto:
```env
# Configuración del Servidor
PORT=3001

# Base de Datos - Desarrollo (Local)
DB_NAME=diagramador
DB_USER=admin
DB_PASSWORD=admin123
DB_HOST=localhost
DB_PORT=5432

# Base de Datos - Producción (DigitalOcean)
# NODE_ENV=production
# DB_HOST=db-postgresql-nyc3-88273-do-user-24994056-0.m.db.ondigitalocean.com
# DB_PORT=25060
# DB_NAME=defaultdb
# DB_USER=doadmin
# DB_PASSWORD=AVNS_KaENTyk7NioFK8Xu9eQ
# DB_SSL=true

# Seguridad
JWT_SECRET=un_secreto_seguro

# OpenAI API (para asistente IA)
OPENAI_API_KEY=sk-proj-xxxxx

# Agente IA
AGENT_URL=https://qcuf4koeqbwvrppcysnzvwym.agents.do-ai.run
AGENT_TOKEN=7Qi0lcEGzx4xFTYUWKfA3JMqhvW2ftM-
AGENT_DEBUG=true
AGENT_MOCK=false
AGENT_MODE=auto

# Frontend (CORS)
FRONT_ORIGIN=http://localhost:3000
```

4. **Configurar archivo `config/config.json` para Sequelize**

El archivo `config/config.json` gestiona las conexiones de base de datos para las migraciones:

```json
{
  "development": {
    "username": "admin",
    "password": "admin123",
    "database": "diagramador",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "doadmin",
    "password": "AVNS_KaENTyk7NioFK8Xu9eQ",
    "database": "defaultdb",
    "host": "db-postgresql-nyc3-88273-do-user-24994056-0.m.db.ondigitalocean.com",
    "port": 25060,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
```

5. **Crear la base de datos (primera vez)**
```powershell
# Crear base de datos local
npm run db:create
```

6. **Ejecutar migraciones de base de datos**
```powershell
# Desarrollo (local)
npm run db:migrate

# Producción (DigitalOcean)
set NODE_ENV=production; npm run db:migrate
```

7. **Iniciar el servidor**

**Opción 1: Modo Desarrollo (Recomendado)**
```powershell
npm run dev
```
- Usa **nodemon** para reinicio automático al detectar cambios
- Conexión a base de datos local (admin:admin123)
- Ideal para desarrollo local

**Opción 2: Modo Producción**
```powershell
npm start
```
- Ejecuta directamente con Node.js
- Conexión a base de datos de producción si NODE_ENV=production
- Para entornos de producción

**Opción 3: Con Node directamente (No recomendado para desarrollo)**
```powershell
node index.js
```
- Sin reinicio automático
- Solo para pruebas rápidas

## Scripts NPM Disponibles

### Scripts de Servidor
| Comando | Descripción | Uso |
|---------|-------------|-----|
| `npm run dev` | Inicia servidor en modo desarrollo con nodemon | ✅ **Recomendado para desarrollo** |
| `npm start` | Inicia servidor en modo producción | Para producción |

### Scripts de Base de Datos
| Comando | Descripción | Uso |
|---------|-------------|-----|
| `npm run db:create` | Crear la base de datos | Primera vez |
| `npm run db:migrate` | Ejecutar migraciones pendientes | Desarrollo |
| `npm run db:migrate:undo` | Deshacer última migración | Revertir cambios |
| `npm run db:seed` | Ejecutar seeders (datos de prueba) | Opcional |
| `npm run db:drop` | Eliminar base de datos | ⚠️ Cuidado |

### Comandos con Entornos
```powershell
# Desarrollo (default)
npm run db:migrate

# Producción
set NODE_ENV=production; npm run db:migrate
```

## Variables de Entorno

### Variables Requeridas
- `PORT`: Puerto del servidor (default: 3001)
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de PostgreSQL
- `DB_PASSWORD`: Contraseña de PostgreSQL
- `DB_HOST`: Host de la base de datos
- `JWT_SECRET`: Secreto para tokens JWT

### Variables Opcionales
- `DB_PORT`: Puerto de PostgreSQL (default: 5432)
- `DB_SSL`: Habilitar SSL para base de datos (true/false)
- `OPENAI_API_KEY`: Clave API de OpenAI para asistente IA
- `AGENT_URL`: URL del agente de IA
- `AGENT_TOKEN`: Token de autenticación del agente
- `FRONT_ORIGIN`: Origen permitido para CORS

### Diferencias entre Desarrollo y Producción

| Aspecto | Desarrollo | Producción |
|---------|-----------|------------|
| Base de datos | PostgreSQL local | PostgreSQL en DigitalOcean |
| SSL | No requerido | Requerido |
| Reinicio automático | Sí (nodemon) | No |
| Host | localhost:3001 | Dominio público |
| Logs | Verbose | Solo errores |

## Despliegue en DigitalOcean

### Configuración de Base de Datos PostgreSQL

1. **Crear Cluster de Base de Datos en DigitalOcean**
   - Ir a "Databases" en el panel de DigitalOcean
   - Crear nuevo cluster PostgreSQL
   - Seleccionar región (ejemplo: NYC3)
   - Elegir plan según necesidades
   - Configurar firewall para permitir conexiones

2. **Obtener credenciales de conexión**
   - Host: `db-postgresql-nyc3-88273-do-user-24994056-0.m.db.ondigitalocean.com`
   - Puerto: `25060`
   - Usuario: `doadmin`
   - Contraseña: Proporcionada por DigitalOcean
   - Base de datos: `defaultdb`
   - SSL: **Requerido** (importante para seguridad)

3. **Configurar variables de entorno para producción**

En tu servidor de producción, crea el archivo `.env`:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Base de Datos de Producción
DB_HOST=db-postgresql-nyc3-88273-do-user-24994056-0.m.db.ondigitalocean.com
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=doadmin
DB_PASSWORD=AVNS_KaENTyk7NioFK8Xu9eQ
DB_SSL=true

# OpenAI y Agente IA
OPENAI_API_KEY=tu_clave_openai
AGENT_URL=https://tu-agente.agents.do-ai.run
AGENT_TOKEN=tu_token_agente

# Frontend
FRONT_ORIGIN=https://tu-dominio.com
```

4. **Actualizar `config/config.json` para producción**

Asegúrate de que el archivo `config/config.json` tenga la configuración correcta:
```json
{
  "production": {
    "username": "doadmin",
    "password": "AVNS_KaENTyk7NioFK8Xu9eQ",
    "database": "defaultdb",
    "host": "db-postgresql-nyc3-88273-do-user-24994056-0.m.db.ondigitalocean.com",
    "port": 25060,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
```

### Despliegue de la Aplicación

1. **Crear y configurar Droplet**
```bash
# Conectar al Droplet
ssh root@tu-droplet-ip

# Actualizar sistema
apt update && apt upgrade -y
```

2. **Instalar Node.js 18+**
```bash
# Instalar Node.js desde NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalación
node --version  # Debe ser v18 o superior
npm --version
```

3. **Clonar y configurar la aplicación**
```bash
# Clonar repositorio
git clone <tu-repositorio>
cd examenBack-sw1

# Instalar dependencias
npm install --production

# Crear archivo .env con configuración de producción
nano .env
# (Pegar configuración de producción mencionada arriba)
```

4. **Ejecutar migraciones en producción**
```bash
# Verificar estado de migraciones
npx sequelize-cli db:migrate:status --env production

# Ejecutar migraciones pendientes
npx sequelize-cli db:migrate --env production

# Verificar que se ejecutaron correctamente
npx sequelize-cli db:migrate:status --env production
```

5. **Configurar PM2 para gestión de procesos**
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
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

6. **Iniciar aplicación con PM2**
```bash
# Crear directorio de logs
mkdir -p logs

# Iniciar aplicación
pm2 start ecosystem.config.js

# Configurar PM2 para iniciar automáticamente al reiniciar servidor
pm2 startup
pm2 save

# Verificar estado
pm2 status
pm2 logs examenBack-sw1

# Monitorear en tiempo real
pm2 monit
```

8. **Configurar Nginx como proxy reverso**
```bash
# Instalar Nginx
apt install nginx -y

# Crear configuración del sitio
nano /etc/nginx/sites-available/examenBack-sw1
```

**Configuración Nginx para HTTP:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Logs
    access_log /var/log/nginx/examenBack-sw1_access.log;
    error_log /var/log/nginx/examenBack-sw1_error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # Headers para proxy
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts para Socket.IO
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Configuración específica para Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Timeouts largos para conexiones persistentes
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
```

```bash
# Habilitar sitio
ln -s /etc/nginx/sites-available/examenBack-sw1 /etc/nginx/sites-enabled/

# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx
```

9. **Configurar SSL con Let's Encrypt (HTTPS)**
```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL gratuito
certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Certbot actualizará automáticamente la configuración de Nginx
# Verificar renovación automática
certbot renew --dry-run

# Ver estado de certificados
certbot certificates
```

**Nginx después de SSL (automático por Certbot):**
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # ... resto de la configuración igual
}
```

10. **Configurar Firewall UFW**
```bash
# Habilitar UFW
ufw enable

# Permitir conexiones SSH
ufw allow OpenSSH

# Permitir HTTP y HTTPS
ufw allow 'Nginx Full'

# Verificar estado
ufw status
```

### Comandos de Gestión en Producción

**Gestión con PM2:**
```bash
# Ver estado de todas las aplicaciones
pm2 status

# Ver logs en tiempo real
pm2 logs examenBack-sw1

# Ver logs específicos
pm2 logs examenBack-sw1 --lines 100

# Reiniciar aplicación
pm2 restart examenBack-sw1

# Detener aplicación
pm2 stop examenBack-sw1

# Iniciar aplicación
pm2 start examenBack-sw1

# Eliminar de PM2
pm2 delete examenBack-sw1

# Monitoreo en tiempo real
pm2 monit

# Información detallada
pm2 show examenBack-sw1
```

**Gestión de Base de Datos:**
```bash
# Ver estado de migraciones
npx sequelize-cli db:migrate:status --env production

# Ejecutar migraciones pendientes
npx sequelize-cli db:migrate --env production

# Revertir última migración
npx sequelize-cli db:migrate:undo --env production

# Revertir todas las migraciones
npx sequelize-cli db:migrate:undo:all --env production
```

**Logs y Monitoreo:**
```bash
# Ver logs de Nginx
tail -f /var/log/nginx/examenBack-sw1_access.log
tail -f /var/log/nginx/examenBack-sw1_error.log

# Ver logs de PM2
pm2 logs examenBack-sw1 --lines 50

# Ver uso de recursos
htop
# o
pm2 monit
```

### Scripts de Despliegue Automatizado

**deploy.sh** - Script para despliegue rápido:
```bash
#!/bin/bash
echo "=========================================="
echo "Iniciando despliegue de examenBack-sw1..."
echo "=========================================="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detener aplicación
echo -e "${YELLOW}Deteniendo aplicación...${NC}"
pm2 stop examenBack-sw1

# Actualizar código desde repositorio
echo -e "${YELLOW}Actualizando código...${NC}"
git pull origin main

# Instalar/actualizar dependencias
echo -e "${YELLOW}Instalando dependencias...${NC}"
npm install --production

# Ejecutar migraciones
echo -e "${YELLOW}Ejecutando migraciones...${NC}"
npx sequelize-cli db:migrate --env production

# Reiniciar aplicación
echo -e "${YELLOW}Reiniciando aplicación...${NC}"
pm2 restart examenBack-sw1

# Verificar estado
echo -e "${YELLOW}Verificando estado...${NC}"
pm2 status examenBack-sw1

echo -e "${GREEN}=========================================="
echo -e "Despliegue completado exitosamente!"
echo -e "==========================================${NC}"
```

**Hacer ejecutable y usar:**
```bash
# Dar permisos de ejecución
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh
```

**backup.sh** - Script para respaldo de base de datos:
```bash
#!/bin/bash
# Script de respaldo de base de datos

BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Realizar backup
echo "Iniciando respaldo..."
PGPASSWORD='tu_password' pg_dump -h db-postgresql-nyc3-xxxxx.m.db.ondigitalocean.com \
  -p 25060 -U doadmin -d defaultdb > $BACKUP_FILE

# Comprimir
gzip $BACKUP_FILE

echo "Respaldo completado: $BACKUP_FILE.gz"

# Eliminar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

**Configurar cron para backups automáticos:**
```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * /root/examenBack-sw1/backup.sh
```

### Troubleshooting en Producción

**1. La aplicación no inicia:**
```bash
# Ver logs detallados
pm2 logs examenBack-sw1 --lines 100

# Verificar variables de entorno
cat .env

# Verificar permisos
ls -la

# Probar inicio manual
node index.js
```

**2. Error de conexión a base de datos:**
```bash
# Verificar credenciales en .env
cat .env | grep DB_

# Probar conexión directa
psql -h db-postgresql-xxx.m.db.ondigitalocean.com -p 25060 -U doadmin -d defaultdb

# Verificar SSL
# Asegurarse que DB_SSL=true esté en .env
```

**3. Error 502 Bad Gateway:**
```bash
# Verificar que la app esté corriendo
pm2 status

# Verificar puerto
netstat -tulpn | grep 3000

# Reiniciar Nginx
systemctl restart nginx

# Ver logs de Nginx
tail -f /var/log/nginx/error.log
```

**4. Socket.IO no funciona:**
```bash
# Verificar configuración de Nginx
cat /etc/nginx/sites-available/examenBack-sw1

# Asegurar que location /socket.io/ esté configurado
# Reiniciar Nginx
systemctl restart nginx
```

**5. Falta de memoria:**
```bash
# Ver uso de memoria
free -h

# Ver procesos que más consumen
ps aux --sort=-%mem | head

# Ajustar límite de memoria en PM2
pm2 stop examenBack-sw1
# Editar ecosystem.config.js y cambiar max_memory_restart
pm2 start ecosystem.config.js
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

### 3. Generar Proyecto Full-Stack
```bash
POST /api/openapi/generate-fullstack/123
Authorization: Bearer <token>
Content-Type: application/json

{
    "backendPort": 8080
}
```

**Respuesta**: Archivo ZIP con proyecto completo (Backend Spring Boot + Frontend Flutter)

### 4. Ejecutar Proyecto Completo
```bash
# Backend Spring Boot
cd backend
./mvnw spring-boot:run

# Frontend Flutter (en otra terminal)
cd frontend
flutter pub get
flutter run
```

### 5. Colaboración en Tiempo Real
```javascript
// Frontend se conecta al diagrama
socket.emit('join-diagram', { roomId: 'diagrama-123' });

// Recibe actualizaciones automáticamente
socket.on('diagram-updated', (diagram) => {
    // Actualizar interfaz con nuevo diagrama
    updateDiagramUI(diagram);
});
```

## Estructura del Proyecto Full-Stack Generado

### Backend Spring Boot
```
backend/
├── src/main/java/com/example/demo/
│   ├── model/              # Entidades JPA
│   ├── dto/                # DTOs de transferencia
│   ├── repository/         # Repositorios JPA
│   ├── service/            # Servicios de negocio
│   └── controller/         # Controladores REST
├── src/main/resources/
│   └── application.properties
├── pom.xml                 # Configuración Maven
├── mvnw                    # Maven Wrapper
└── Dockerfile              # Configuración Docker
```

### Frontend Flutter
```
frontend/
├── lib/
│   ├── models/             # Modelos Dart
│   ├── services/           # Servicios API
│   ├── screens/            # Pantallas de la aplicación
│   ├── widgets/            # Widgets reutilizables
│   ├── config/             # Configuración de API
│   └── main.dart           # Punto de entrada
├── android/                # Configuración Android
├── ios/                    # Configuración iOS
├── pubspec.yaml            # Dependencias Flutter
└── README.md               # Documentación
```

### Scripts de Ejecución
```
scripts/
├── start-backend.sh        # Iniciar backend
├── start-frontend.sh       # Iniciar frontend
└── start-fullstack.sh      # Iniciar ambos
```

## Ventajas del Sistema

### Para Desarrolladores
- **Ahorro de tiempo**: Generación automática de código repetitivo
- **Consistencia**: Patrones de código uniformes
- **Calidad**: Código probado y sin errores
- **Documentación**: README automático con ejemplos
- **Conexión automática**: Backend y frontend ya configurados para trabajar juntos

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

### Problemas Comunes en Desarrollo

#### 1. Error de conexión a PostgreSQL
```powershell
# Verificar que PostgreSQL esté corriendo
# En Windows, buscar "Services" y verificar que PostgreSQL esté iniciado

# Verificar credenciales en .env
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=diagramador
DB_HOST=localhost
DB_PORT=5432

# Probar conexión manualmente
psql -U admin -d diagramador
```

#### 2. Error "database does not exist"
```powershell
# Crear la base de datos
npm run db:create

# Si persiste, crear manualmente
psql -U admin
CREATE DATABASE diagramador;
\q
```

#### 3. Error en migraciones
```powershell
# Ver estado de migraciones
npx sequelize-cli db:migrate:status

# Deshacer última migración
npm run db:migrate:undo

# Ejecutar migraciones nuevamente
npm run db:migrate

# Si hay error de sincronización, recrear base de datos
npm run db:drop
npm run db:create
npm run db:migrate
```

#### 4. Puerto ya en uso (EADDRINUSE)
```powershell
# Ver qué proceso usa el puerto 3001
netstat -ano | findstr :3001

# Matar el proceso (reemplazar PID con el número encontrado)
taskkill /PID [PID] /F

# O cambiar el puerto en .env
PORT=3002
```

#### 5. Error "Cannot find module"
```powershell
# Limpiar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules
npm install

# Si persiste, limpiar cache de npm
npm cache clean --force
npm install
```

#### 6. Error de autenticación JWT
```powershell
# Verificar que JWT_SECRET esté en .env
cat .env | Select-String JWT_SECRET

# Regenerar token en el frontend
# Hacer logout y login nuevamente
```

### Problemas Comunes en Producción

#### 1. Error de Compilación en Spring Boot
```bash
# Verificar que Java 17+ esté instalado
java -version

# Si no está instalado, instalar OpenJDK 17
apt install openjdk-17-jdk -y

# Limpiar y recompilar proyecto generado
cd backend
./mvnw clean compile
./mvnw spring-boot:run
```

#### 2. Error de Conexión a Base de Datos en Producción
```bash
# Verificar variables de entorno
cat .env | grep DB_

# Verificar que DB_SSL=true esté configurado
# Probar conexión directa
PGPASSWORD='tu_password' psql -h db-postgresql-xxx.m.db.ondigitalocean.com \
  -p 25060 -U doadmin -d defaultdb

# Verificar estado de migraciones
npx sequelize-cli db:migrate:status --env production
```

#### 3. Problemas de Socket.IO
```javascript
// En el frontend, verificar conexión
console.log('Socket conectado:', socket.connected);

// Verificar URL de conexión
const socket = io('https://tu-dominio.com', {
  transports: ['websocket', 'polling']
});

// Reconectar si es necesario
socket.connect();
```

```bash
# En el servidor, verificar configuración de Nginx
cat /etc/nginx/sites-available/examenBack-sw1
# Asegurar que /socket.io/ esté configurado correctamente
```

#### 4. Error de Compilación en Flutter
```bash
# Verificar que Flutter esté instalado
flutter --version

# Verificar requisitos
flutter doctor

# Limpiar y obtener dependencias
cd frontend
flutter clean
flutter pub get

# Si hay problemas de generación de código
flutter pub run build_runner build --delete-conflicting-outputs
```

#### 5. Error de Conexión API en Flutter
```dart
// Verificar configuración en lib/config/api_config.dart
class ApiConfig {
  // Para desarrollo local
  static const String baseUrl = 'http://localhost:8080/api';
  
  // Para dispositivo físico en misma red
  // static const String baseUrl = 'http://192.168.1.X:8080/api';
  
  // Para producción
  // static const String baseUrl = 'https://api.tu-dominio.com/api';
}
```

```bash
# Backend debe estar corriendo
# Verificar que CORS esté configurado correctamente
# En el backend, verificar que FRONT_ORIGIN permita el origen
```

#### 6. Problemas de Dependencias Flutter
```bash
# Actualizar dependencias
cd frontend
flutter pub upgrade

# Ver árbol de dependencias
flutter pub deps

# Verificar problemas
flutter pub outdated

# Si hay conflictos, editar pubspec.yaml manualmente
```

#### 7. Error 502 Bad Gateway (Nginx)
```bash
# Verificar que la aplicación esté corriendo
pm2 status

# Ver logs de PM2
pm2 logs examenBack-sw1

# Reiniciar aplicación
pm2 restart examenBack-sw1

# Ver logs de Nginx
tail -f /var/log/nginx/error.log

# Reiniciar Nginx
systemctl restart nginx
```

#### 8. Certificado SSL expirado
```bash
# Ver estado de certificados
certbot certificates

# Renovar certificados manualmente
certbot renew

# Verificar renovación automática
certbot renew --dry-run

# Si falla, renovar forzosamente
certbot renew --force-renewal
```

#### 9. Espacio en disco lleno
```bash
# Ver uso de disco
df -h

# Ver archivos más grandes
du -h --max-depth=1 / | sort -hr | head -20

# Limpiar logs de PM2
pm2 flush

# Limpiar logs de Nginx
truncate -s 0 /var/log/nginx/*.log

# Limpiar archivos temporales generados
cd /tmp
rm -rf generated_*
```

#### 10. Alto uso de memoria
```bash
# Ver uso de memoria
free -h

# Ver procesos que más consumen
ps aux --sort=-%mem | head -10

# Ajustar límite de memoria en PM2
nano ecosystem.config.js
# Cambiar max_memory_restart: '1G' a '512M' si es necesario

# Reiniciar con nueva configuración
pm2 delete examenBack-sw1
pm2 start ecosystem.config.js
```

### Verificación de Estado del Sistema

**Script de verificación completa (check-health.sh):**
```bash
#!/bin/bash
echo "=== Estado del Sistema ==="

echo -e "\n1. Estado de PM2:"
pm2 status

echo -e "\n2. Estado de Nginx:"
systemctl status nginx --no-pager

echo -e "\n3. Uso de Memoria:"
free -h

echo -e "\n4. Uso de Disco:"
df -h

echo -e "\n5. Base de Datos (últimas 5 migraciones):"
npx sequelize-cli db:migrate:status --env production | tail -5

echo -e "\n6. Certificado SSL:"
certbot certificates

echo -e "\n7. Últimos logs de aplicación:"
pm2 logs examenBack-sw1 --lines 10 --nostream

echo -e "\n=== Verificación Completa ==="
```

```bash
# Hacer ejecutable
chmod +x check-health.sh

# Ejecutar
./check-health.sh
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

**Desarrollado con Node.js, Express.js, Socket.IO, Spring Boot y Flutter**