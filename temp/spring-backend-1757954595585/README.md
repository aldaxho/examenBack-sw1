# Test Duplicate Fields - Spring Boot API

## 🚀 Cómo ejecutar

### Prerrequisitos
- Java 17 o superior
- **NO necesitas instalar Maven** - el proyecto incluye Maven Wrapper

### Pasos
1. Navegar al directorio del proyecto:
   ```bash
   cd spring-backend-1757954595585
   ```

2. **Usar Maven Wrapper (recomendado):**
   ```bash
   # En Windows:
   .\mvnw.cmd clean compile
   .\mvnw.cmd spring-boot:run
   
   # En Linux/Mac:
   ./mvnw clean compile
   ./mvnw spring-boot:run
   ```

3. **O usar Maven instalado (si lo tienes):**
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```

4. La API estará disponible en: http://localhost:8080

### 🧪 Ejecutar Tests Automáticos
```bash
# Ejecutar tests para verificar la integridad del proyecto
./mvnw test

# Los tests verifican:
# - ✅ No hay campos duplicados en entidades
# - ✅ No hay columnas JPA duplicadas
# - ✅ Las entidades se pueden instanciar correctamente
# - ✅ Los repositorios funcionan correctamente
# - ✅ La aplicación inicia sin errores
```

### 🔧 Solución de Problemas Comunes

#### Problema: Maven Wrapper Corrupto
Si encuentras el error "Could not find or load main class org.apache.maven.wrapper.MavenWrapperMain":
```bash
# Windows PowerShell:
if (!(Test-Path ".mvn\\wrapper\\maven-wrapper.jar") -or (Get-Item ".mvn\\wrapper\\maven-wrapper.jar").Length -lt 50000) {
    Write-Host "Reparando Maven Wrapper..."
    Remove-Item ".mvn\\wrapper\\maven-wrapper.jar" -Force -ErrorAction SilentlyContinue
    Invoke-WebRequest -Uri "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -OutFile ".mvn\\wrapper\\maven-wrapper.jar"
}

# Linux/Mac:
if [ ! -f ".mvn/wrapper/maven-wrapper.jar" ] || [ $(stat -c%s ".mvn/wrapper/maven-wrapper.jar") -lt 50000 ]; then
    echo "Reparando Maven Wrapper..."
    rm -f ".mvn/wrapper/maven-wrapper.jar"
    curl -L "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -o ".mvn/wrapper/maven-wrapper.jar"
fi
```

#### Problema: Puerto 8080 Ocupado
Si el puerto 8080 está ocupado, cambia el puerto en application.properties:
```properties
server.port=8081
```

### 📚 Endpoints disponibles

#### Base URL: http://localhost:8080/api


**Cliente:**
- GET /api/cliente - Obtener todos
- GET /api/cliente/{id} - Obtener por ID
- POST /api/cliente - Crear nuevo
- PUT /api/cliente/{id} - Actualizar completamente
- PATCH /api/cliente/{id} - Actualizar parcialmente
- DELETE /api/cliente/{id} - Eliminar
- GET /api/cliente/count - Contar registros
**Cuenta:**
- GET /api/cuenta - Obtener todos
- GET /api/cuenta/{id} - Obtener por ID
- POST /api/cuenta - Crear nuevo
- PUT /api/cuenta/{id} - Actualizar completamente
- PATCH /api/cuenta/{id} - Actualizar parcialmente
- DELETE /api/cuenta/{id} - Eliminar
- GET /api/cuenta/count - Contar registros

### 🧪 Pruebas con Postman

#### 📥 Importar Colección de Postman
**Opción 1: Archivo incluido (Recomendado)**
1. Abre Postman
2. Haz clic en "Import" (Importar)
3. Selecciona el archivo `postman-collection.json` incluido en el proyecto
4. ¡Listo! La colección se importará automáticamente

**Opción 2: Copiar y pegar**
1. Abre Postman
2. Haz clic en "Import" (Importar)
3. Selecciona "Raw text" y copia el siguiente JSON:

```json
{
  "info": {
    "name": "Test Duplicate Fields - Spring Boot API",
    "description": "Colección de pruebas para la API generada automáticamente",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080/api",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Cliente",
      "item": [
        {
          "name": "Obtener todos los cliente",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/cliente",
              "host": ["{{baseUrl}}"],
              "path": ["cliente"]
            }
          }
        },
        {
          "name": "Obtener cliente por ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/cliente/1",
              "host": ["{{baseUrl}}"],
              "path": ["cliente", "1"]
            }
          }
        },
        {
          "name": "Crear nuevo cliente",
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
              "raw": "{\n  \"name\": \"Ejemplo Cliente\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/cliente",
              "host": ["{{baseUrl}}"],
              "path": ["cliente"]
            }
          }
        },
        {
          "name": "Actualizar cliente completamente",
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
              "raw": "{\n  \"id\": 1,\n  \"name\": \"Cliente Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/cliente/1",
              "host": ["{{baseUrl}}"],
              "path": ["cliente", "1"]
            }
          }
        },
        {
          "name": "Actualizar cliente parcialmente",
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
              "raw": "{\n  \"name\": \"Cliente Parcialmente Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/cliente/1",
              "host": ["{{baseUrl}}"],
              "path": ["cliente", "1"]
            }
          }
        },
        {
          "name": "Eliminar cliente",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/cliente/1",
              "host": ["{{baseUrl}}"],
              "path": ["cliente", "1"]
            }
          }
        },
        {
          "name": "Contar cliente",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/cliente/count",
              "host": ["{{baseUrl}}"],
              "path": ["cliente", "count"]
            }
          }
        }
      ]
    },{
      "name": "Cuenta",
      "item": [
        {
          "name": "Obtener todos los cuenta",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/cuenta",
              "host": ["{{baseUrl}}"],
              "path": ["cuenta"]
            }
          }
        },
        {
          "name": "Obtener cuenta por ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/cuenta/1",
              "host": ["{{baseUrl}}"],
              "path": ["cuenta", "1"]
            }
          }
        },
        {
          "name": "Crear nuevo cuenta",
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
              "raw": "{\n  \"name\": \"Ejemplo Cuenta\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/cuenta",
              "host": ["{{baseUrl}}"],
              "path": ["cuenta"]
            }
          }
        },
        {
          "name": "Actualizar cuenta completamente",
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
              "raw": "{\n  \"id\": 1,\n  \"name\": \"Cuenta Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/cuenta/1",
              "host": ["{{baseUrl}}"],
              "path": ["cuenta", "1"]
            }
          }
        },
        {
          "name": "Actualizar cuenta parcialmente",
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
              "raw": "{\n  \"name\": \"Cuenta Parcialmente Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/cuenta/1",
              "host": ["{{baseUrl}}"],
              "path": ["cuenta", "1"]
            }
          }
        },
        {
          "name": "Eliminar cuenta",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/cuenta/1",
              "host": ["{{baseUrl}}"],
              "path": ["cuenta", "1"]
            }
          }
        },
        {
          "name": "Contar cuenta",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/cuenta/count",
              "host": ["{{baseUrl}}"],
              "path": ["cuenta", "count"]
            }
          }
        }
      ]
    }
  ]
}
```

#### 🔧 Configuración de Variables
1. En Postman, ve a la pestaña "Variables"
2. Configura la variable `baseUrl` con: `http://localhost:8080/api`
3. Si cambias el puerto, actualiza la variable `baseUrl`

#### 📋 Ejemplos de Pruebas Paso a Paso

##### 1. **Probar Endpoint GET (Obtener todos)**
- **Método:** GET
- **URL:** `{{baseUrl}}/account`
- **Respuesta esperada:** Lista de cuentas (puede estar vacía inicialmente)

##### 2. **Probar Endpoint POST (Crear nuevo)**
- **Método:** POST
- **URL:** `{{baseUrl}}/account`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "accountNumber": "12345",
  "balance": 1000.0,
  "accountType": "CHECKING"
}
```
- **Respuesta esperada:** `201 Created` con el objeto creado

##### 3. **Probar Endpoint PUT (Actualizar completamente)**
- **Método:** PUT
- **URL:** `{{baseUrl}}/account/1`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "id": 1,
  "accountNumber": "12345",
  "balance": 2000.0,
  "accountType": "SAVINGS"
}
```
- **Respuesta esperada:** `200 OK` con el objeto actualizado

##### 4. **Probar Endpoint PATCH (Actualizar parcialmente)**
- **Método:** PATCH
- **URL:** `{{baseUrl}}/account/1`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "balance": 1500.0
}
```
- **Respuesta esperada:** `200 OK` con el objeto parcialmente actualizado

##### 5. **Probar Endpoint DELETE (Eliminar)**
- **Método:** DELETE
- **URL:** `{{baseUrl}}/account/1`
- **Respuesta esperada:** `204 No Content`

#### 🎯 Flujo de Pruebas Recomendado
1. **Crear** un nuevo registro con POST
2. **Obtener** el registro creado con GET por ID
3. **Actualizar** completamente con PUT
4. **Actualizar** parcialmente con PATCH
5. **Obtener todos** los registros con GET
6. **Contar** registros con GET /count
7. **Eliminar** el registro con DELETE
8. **Verificar** que fue eliminado con GET por ID (debe devolver 404)

#### ⚠️ Notas Importantes
- **Asegúrate** de que la aplicación esté ejecutándose en `http://localhost:8080`
- **Los IDs** pueden variar según los datos existentes
- **Algunos endpoints** pueden devolver `404 Not Found` si no hay datos
- **Los campos** en el JSON pueden variar según las entidades generadas

### 🗄️ Base de datos

Por defecto, el proyecto usa **H2 Database** (en memoria) para facilitar el desarrollo:
- **URL JDBC:** jdbc:h2:mem:testdb
- **Usuario:** sa
- **Contraseña:** password
- **Consola H2:** http://localhost:8080/h2-console

### 🔧 Configuración

#### Cambiar a PostgreSQL (Producción)
1. Agregar dependencia en `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

2. Modificar `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/tu_base_datos
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

### 🐳 Docker

Para ejecutar con Docker:
```bash
# Compilar el proyecto
./mvnw clean package -DskipTests

# Construir imagen Docker
docker build -t test-duplicate-fields-api .

# Ejecutar contenedor
docker run -p 8080:8080 test-duplicate-fields-api
```

### 📋 Estructura del proyecto

```
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
```

### ⚡ Desarrollo

#### Hot Reload
Para desarrollo con recarga automática:
```bash
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.profiles.active=dev"
```

#### Tests
```bash
./mvnw test
```

### 🚨 Problemas comunes

1. **Puerto 8080 ocupado:**
   - Cambiar puerto en `application.properties`: `server.port=8081`
   
2. **Error de Java:**
   - Verificar que Java 17+ esté instalado: `java -version`
   
3. **Problemas de permisos:**
   - En Linux/Mac: `chmod +x mvnw`

### 📚 Documentación adicional

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [H2 Database](https://www.h2database.com/)

---
**Generado automáticamente con ❤️**
- **Cliente**: http://localhost:8080/api/clientes
- **Cuenta**: http://localhost:8080/api/cuentas

### 🗄️ Base de datos
- **H2 Console**: http://localhost:8080/h2-console
- **JDBC URL**: jdbc:h2:mem:testdb
- **Usuario**: sa
- **Contraseña**: password

### 📝 Entidades generadas
- Cliente
- Cuenta

### 🔧 Operaciones CRUD disponibles para cada entidad:
- `GET /api/{entidad}s` - Obtener todos
- `GET /api/{entidad}s/{id}` - Obtener por ID
- `POST /api/{entidad}s` - Crear nuevo
- `PUT /api/{entidad}s/{id}` - Actualizar
- `DELETE /api/{entidad}s/{id}` - Eliminar

### 💡 Ventajas del Maven Wrapper:
- ✅ **No necesitas instalar Maven** en tu sistema
- ✅ **Versión consistente** de Maven para todos los desarrolladores
- ✅ **Funciona inmediatamente** después de descargar el proyecto
- ✅ **Compatible** con Windows, Linux y Mac

¡Proyecto Spring Boot generado automáticamente desde diagrama UML! 🎉