# Sistema de Prueba Final - Spring Boot API

## Instalación y Ejecución

### Prerrequisitos
- Java 17 o superior
- El proyecto incluye Maven Wrapper (no necesitas instalar Maven)

### Pasos para ejecutar

1. Navegar al directorio del proyecto:
   ```bash
   cd spring-backend-1758950334087
   ```

2. Compilar y ejecutar:
   ```bash
   # En Windows:
   .\mvnw.cmd clean compile
   .\mvnw.cmd spring-boot:run
   
   # En Linux/Mac:
   ./mvnw clean compile
   ./mvnw spring-boot:run
   ```

3. La API estará disponible en: http://localhost:8080

### Ejecutar Tests
```bash
./mvnw test
```

## Endpoints Disponibles

### Base URL: http://localhost:8080/api


### Persona

- GET /api/persona - Obtener todos los registros
- GET /api/persona/{id} - Obtener registro por ID
- POST /api/persona - Crear nuevo registro
- PUT /api/persona/{id} - Actualizar registro completo
- PATCH /api/persona/{id} - Actualizar registro parcial
- DELETE /api/persona/{id} - Eliminar registro
- GET /api/persona/count - Contar registros
### Producto

- GET /api/producto - Obtener todos los registros
- GET /api/producto/{id} - Obtener registro por ID
- POST /api/producto - Crear nuevo registro
- PUT /api/producto/{id} - Actualizar registro completo
- PATCH /api/producto/{id} - Actualizar registro parcial
- DELETE /api/producto/{id} - Eliminar registro
- GET /api/producto/count - Contar registros

## Pruebas con Postman

### Configuración básica
1. Abre Postman
2. Crea una nueva colección
3. Configura la variable de entorno `baseUrl` con el valor: `http://localhost:8080/api`

### Ejemplos de Pruebas


#### Persona

**Obtener todos los persona**
- Método: GET
- URL: `{{baseUrl}}/persona`

**Crear nuevo persona**
- Método: POST
- URL: `{{baseUrl}}/persona`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "nombre": "aldair",
  "apellido": "prueba"
}
```

**Obtener persona por ID**
- Método: GET
- URL: `{{baseUrl}}/persona/1`

**Actualizar persona completamente**
- Método: PUT
- URL: `{{baseUrl}}/persona/1`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "id": 1,
  "nombre": "Persona Actualizado",
  "apellido": "Apellido Actualizado"
}
```

**Actualizar persona parcialmente**
- Método: PATCH
- URL: `{{baseUrl}}/persona/1`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "nombre": "Persona Parcialmente Actualizado"
}
```

**Eliminar persona**
- Método: DELETE
- URL: `{{baseUrl}}/persona/1`

**Contar persona**
- Método: GET
- URL: `{{baseUrl}}/persona/count`
#### Producto

**Obtener todos los producto**
- Método: GET
- URL: `{{baseUrl}}/producto`

**Crear nuevo producto**
- Método: POST
- URL: `{{baseUrl}}/producto`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "nombre": "aldair",
  "apellido": "prueba"
}
```

**Obtener producto por ID**
- Método: GET
- URL: `{{baseUrl}}/producto/1`

**Actualizar producto completamente**
- Método: PUT
- URL: `{{baseUrl}}/producto/1`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "id": 1,
  "nombre": "Producto Actualizado",
  "apellido": "Apellido Actualizado"
}
```

**Actualizar producto parcialmente**
- Método: PATCH
- URL: `{{baseUrl}}/producto/1`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "nombre": "Producto Parcialmente Actualizado"
}
```

**Eliminar producto**
- Método: DELETE
- URL: `{{baseUrl}}/producto/1`

**Contar producto**
- Método: GET
- URL: `{{baseUrl}}/producto/count`

## Base de Datos

El proyecto usa H2 Database (en memoria) para desarrollo:
- URL JDBC: jdbc:h2:mem:testdb
- Usuario: sa
- Contraseña: password
- Consola H2: http://localhost:8080/h2-console

## Configuración

### Cambiar Puerto
Si el puerto 8080 está ocupado, modifica `application.properties`:
```properties
server.port=8081
```

### Cambiar a PostgreSQL (Producción)
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

## Estructura del Proyecto

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

## Solución de Problemas

### Maven Wrapper Corrupto
Si encuentras el error "Could not find or load main class org.apache.maven.wrapper.MavenWrapperMain":

**Windows PowerShell:**
```powershell
if (!(Test-Path ".mvn\wrapper\maven-wrapper.jar") -or (Get-Item ".mvn\wrapper\maven-wrapper.jar").Length -lt 50000) {
    Write-Host "Reparando Maven Wrapper..."
    Remove-Item ".mvn\wrapper\maven-wrapper.jar" -Force -ErrorAction SilentlyContinue
    Invoke-WebRequest -Uri "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -OutFile ".mvn\wrapper\maven-wrapper.jar"
}
```

**Linux/Mac:**
```bash
if [ ! -f ".mvn/wrapper/maven-wrapper.jar" ] || [ $(stat -c%s ".mvn/wrapper/maven-wrapper.jar") -lt 50000 ]; then
    echo "Reparando Maven Wrapper..."
    rm -f ".mvn/wrapper/maven-wrapper.jar"
    curl -L "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -o ".mvn/wrapper/maven-wrapper.jar"
fi
```

### Otros Problemas Comunes
1. **Puerto 8080 ocupado:** Cambiar puerto en `application.properties`
2. **Error de Java:** Verificar que Java 17+ esté instalado con `java -version`
3. **Problemas de permisos:** En Linux/Mac ejecutar `chmod +x mvnw`

## Documentación Adicional

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [H2 Database](https://www.h2database.com/)

---

**Proyecto generado automáticamente desde diagrama UML**

### Entidades Generadas
- Persona
- Producto

### Operaciones CRUD Disponibles
- GET /api/{entidad} - Obtener todos
- GET /api/{entidad}/{id} - Obtener por ID
- POST /api/{entidad} - Crear nuevo
- PUT /api/{entidad}/{id} - Actualizar completo
- PATCH /api/{entidad}/{id} - Actualizar parcial
- DELETE /api/{entidad}/{id} - Eliminar
- GET /api/{entidad}/count - Contar registros