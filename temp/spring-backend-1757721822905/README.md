# probando ia - Spring Boot API

## 🚀 Cómo ejecutar

### Prerrequisitos
- Java 17 o superior
- **NO necesitas instalar Maven** - el proyecto incluye Maven Wrapper

### Pasos
1. Navegar al directorio del proyecto:
   ```bash
   cd spring-backend-1757721822905
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


**Account:**
- GET /api/account - Obtener todos
- GET /api/account/{id} - Obtener por ID
- POST /api/account - Crear nuevo
- PUT /api/account/{id} - Actualizar completamente
- PATCH /api/account/{id} - Actualizar parcialmente
- DELETE /api/account/{id} - Eliminar
- GET /api/account/count - Contar registros
**Branch:**
- GET /api/branch - Obtener todos
- GET /api/branch/{id} - Obtener por ID
- POST /api/branch - Crear nuevo
- PUT /api/branch/{id} - Actualizar completamente
- PATCH /api/branch/{id} - Actualizar parcialmente
- DELETE /api/branch/{id} - Eliminar
- GET /api/branch/count - Contar registros
**Customer:**
- GET /api/customer - Obtener todos
- GET /api/customer/{id} - Obtener por ID
- POST /api/customer - Crear nuevo
- PUT /api/customer/{id} - Actualizar completamente
- PATCH /api/customer/{id} - Actualizar parcialmente
- DELETE /api/customer/{id} - Eliminar
- GET /api/customer/count - Contar registros
**Employee:**
- GET /api/employee - Obtener todos
- GET /api/employee/{id} - Obtener por ID
- POST /api/employee - Crear nuevo
- PUT /api/employee/{id} - Actualizar completamente
- PATCH /api/employee/{id} - Actualizar parcialmente
- DELETE /api/employee/{id} - Eliminar
- GET /api/employee/count - Contar registros
**Loan:**
- GET /api/loan - Obtener todos
- GET /api/loan/{id} - Obtener por ID
- POST /api/loan - Crear nuevo
- PUT /api/loan/{id} - Actualizar completamente
- PATCH /api/loan/{id} - Actualizar parcialmente
- DELETE /api/loan/{id} - Eliminar
- GET /api/loan/count - Contar registros
**Transaction:**
- GET /api/transaction - Obtener todos
- GET /api/transaction/{id} - Obtener por ID
- POST /api/transaction - Crear nuevo
- PUT /api/transaction/{id} - Actualizar completamente
- PATCH /api/transaction/{id} - Actualizar parcialmente
- DELETE /api/transaction/{id} - Eliminar
- GET /api/transaction/count - Contar registros

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
    "name": "probando ia - Spring Boot API",
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
      "name": "Account",
      "item": [
        {
          "name": "Obtener todos los account",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/account",
              "host": ["{{baseUrl}}"],
              "path": ["account"]
            }
          }
        },
        {
          "name": "Obtener account por ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/account/1",
              "host": ["{{baseUrl}}"],
              "path": ["account", "1"]
            }
          }
        },
        {
          "name": "Crear nuevo account",
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
              "raw": "{\n  \"name\": \"Ejemplo Account\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/account",
              "host": ["{{baseUrl}}"],
              "path": ["account"]
            }
          }
        },
        {
          "name": "Actualizar account completamente",
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
              "raw": "{\n  \"id\": 1,\n  \"name\": \"Account Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/account/1",
              "host": ["{{baseUrl}}"],
              "path": ["account", "1"]
            }
          }
        },
        {
          "name": "Actualizar account parcialmente",
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
              "raw": "{\n  \"name\": \"Account Parcialmente Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/account/1",
              "host": ["{{baseUrl}}"],
              "path": ["account", "1"]
            }
          }
        },
        {
          "name": "Eliminar account",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/account/1",
              "host": ["{{baseUrl}}"],
              "path": ["account", "1"]
            }
          }
        },
        {
          "name": "Contar account",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/account/count",
              "host": ["{{baseUrl}}"],
              "path": ["account", "count"]
            }
          }
        }
      ]
    },{
      "name": "Branch",
      "item": [
        {
          "name": "Obtener todos los branch",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/branch",
              "host": ["{{baseUrl}}"],
              "path": ["branch"]
            }
          }
        },
        {
          "name": "Obtener branch por ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/branch/1",
              "host": ["{{baseUrl}}"],
              "path": ["branch", "1"]
            }
          }
        },
        {
          "name": "Crear nuevo branch",
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
              "raw": "{\n  \"name\": \"Ejemplo Branch\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/branch",
              "host": ["{{baseUrl}}"],
              "path": ["branch"]
            }
          }
        },
        {
          "name": "Actualizar branch completamente",
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
              "raw": "{\n  \"id\": 1,\n  \"name\": \"Branch Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/branch/1",
              "host": ["{{baseUrl}}"],
              "path": ["branch", "1"]
            }
          }
        },
        {
          "name": "Actualizar branch parcialmente",
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
              "raw": "{\n  \"name\": \"Branch Parcialmente Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/branch/1",
              "host": ["{{baseUrl}}"],
              "path": ["branch", "1"]
            }
          }
        },
        {
          "name": "Eliminar branch",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/branch/1",
              "host": ["{{baseUrl}}"],
              "path": ["branch", "1"]
            }
          }
        },
        {
          "name": "Contar branch",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/branch/count",
              "host": ["{{baseUrl}}"],
              "path": ["branch", "count"]
            }
          }
        }
      ]
    },{
      "name": "Customer",
      "item": [
        {
          "name": "Obtener todos los customer",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/customer",
              "host": ["{{baseUrl}}"],
              "path": ["customer"]
            }
          }
        },
        {
          "name": "Obtener customer por ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/customer/1",
              "host": ["{{baseUrl}}"],
              "path": ["customer", "1"]
            }
          }
        },
        {
          "name": "Crear nuevo customer",
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
              "raw": "{\n  \"name\": \"Ejemplo Customer\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/customer",
              "host": ["{{baseUrl}}"],
              "path": ["customer"]
            }
          }
        },
        {
          "name": "Actualizar customer completamente",
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
              "raw": "{\n  \"id\": 1,\n  \"name\": \"Customer Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/customer/1",
              "host": ["{{baseUrl}}"],
              "path": ["customer", "1"]
            }
          }
        },
        {
          "name": "Actualizar customer parcialmente",
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
              "raw": "{\n  \"name\": \"Customer Parcialmente Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/customer/1",
              "host": ["{{baseUrl}}"],
              "path": ["customer", "1"]
            }
          }
        },
        {
          "name": "Eliminar customer",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/customer/1",
              "host": ["{{baseUrl}}"],
              "path": ["customer", "1"]
            }
          }
        },
        {
          "name": "Contar customer",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/customer/count",
              "host": ["{{baseUrl}}"],
              "path": ["customer", "count"]
            }
          }
        }
      ]
    },{
      "name": "Employee",
      "item": [
        {
          "name": "Obtener todos los employee",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/employee",
              "host": ["{{baseUrl}}"],
              "path": ["employee"]
            }
          }
        },
        {
          "name": "Obtener employee por ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/employee/1",
              "host": ["{{baseUrl}}"],
              "path": ["employee", "1"]
            }
          }
        },
        {
          "name": "Crear nuevo employee",
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
              "raw": "{\n  \"name\": \"Ejemplo Employee\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/employee",
              "host": ["{{baseUrl}}"],
              "path": ["employee"]
            }
          }
        },
        {
          "name": "Actualizar employee completamente",
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
              "raw": "{\n  \"id\": 1,\n  \"name\": \"Employee Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/employee/1",
              "host": ["{{baseUrl}}"],
              "path": ["employee", "1"]
            }
          }
        },
        {
          "name": "Actualizar employee parcialmente",
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
              "raw": "{\n  \"name\": \"Employee Parcialmente Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/employee/1",
              "host": ["{{baseUrl}}"],
              "path": ["employee", "1"]
            }
          }
        },
        {
          "name": "Eliminar employee",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/employee/1",
              "host": ["{{baseUrl}}"],
              "path": ["employee", "1"]
            }
          }
        },
        {
          "name": "Contar employee",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/employee/count",
              "host": ["{{baseUrl}}"],
              "path": ["employee", "count"]
            }
          }
        }
      ]
    },{
      "name": "Loan",
      "item": [
        {
          "name": "Obtener todos los loan",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/loan",
              "host": ["{{baseUrl}}"],
              "path": ["loan"]
            }
          }
        },
        {
          "name": "Obtener loan por ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/loan/1",
              "host": ["{{baseUrl}}"],
              "path": ["loan", "1"]
            }
          }
        },
        {
          "name": "Crear nuevo loan",
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
              "raw": "{\n  \"name\": \"Ejemplo Loan\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/loan",
              "host": ["{{baseUrl}}"],
              "path": ["loan"]
            }
          }
        },
        {
          "name": "Actualizar loan completamente",
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
              "raw": "{\n  \"id\": 1,\n  \"name\": \"Loan Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/loan/1",
              "host": ["{{baseUrl}}"],
              "path": ["loan", "1"]
            }
          }
        },
        {
          "name": "Actualizar loan parcialmente",
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
              "raw": "{\n  \"name\": \"Loan Parcialmente Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/loan/1",
              "host": ["{{baseUrl}}"],
              "path": ["loan", "1"]
            }
          }
        },
        {
          "name": "Eliminar loan",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/loan/1",
              "host": ["{{baseUrl}}"],
              "path": ["loan", "1"]
            }
          }
        },
        {
          "name": "Contar loan",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/loan/count",
              "host": ["{{baseUrl}}"],
              "path": ["loan", "count"]
            }
          }
        }
      ]
    },{
      "name": "Transaction",
      "item": [
        {
          "name": "Obtener todos los transaction",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/transaction",
              "host": ["{{baseUrl}}"],
              "path": ["transaction"]
            }
          }
        },
        {
          "name": "Obtener transaction por ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/transaction/1",
              "host": ["{{baseUrl}}"],
              "path": ["transaction", "1"]
            }
          }
        },
        {
          "name": "Crear nuevo transaction",
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
              "raw": "{\n  \"name\": \"Ejemplo Transaction\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/transaction",
              "host": ["{{baseUrl}}"],
              "path": ["transaction"]
            }
          }
        },
        {
          "name": "Actualizar transaction completamente",
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
              "raw": "{\n  \"id\": 1,\n  \"name\": \"Transaction Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/transaction/1",
              "host": ["{{baseUrl}}"],
              "path": ["transaction", "1"]
            }
          }
        },
        {
          "name": "Actualizar transaction parcialmente",
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
              "raw": "{\n  \"name\": \"Transaction Parcialmente Actualizado\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/transaction/1",
              "host": ["{{baseUrl}}"],
              "path": ["transaction", "1"]
            }
          }
        },
        {
          "name": "Eliminar transaction",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/transaction/1",
              "host": ["{{baseUrl}}"],
              "path": ["transaction", "1"]
            }
          }
        },
        {
          "name": "Contar transaction",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/transaction/count",
              "host": ["{{baseUrl}}"],
              "path": ["transaction", "count"]
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
docker build -t probando-ia-api .

# Ejecutar contenedor
docker run -p 8080:8080 probando-ia-api
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
- **Account**: http://localhost:8080/api/accounts
- **Branch**: http://localhost:8080/api/branchs
- **Customer**: http://localhost:8080/api/customers
- **Employee**: http://localhost:8080/api/employees
- **Loan**: http://localhost:8080/api/loans
- **Transaction**: http://localhost:8080/api/transactions

### 🗄️ Base de datos
- **H2 Console**: http://localhost:8080/h2-console
- **JDBC URL**: jdbc:h2:mem:testdb
- **Usuario**: sa
- **Contraseña**: password

### 📝 Entidades generadas
- Account
- Branch
- Customer
- Employee
- Loan
- Transaction

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