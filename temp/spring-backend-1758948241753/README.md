# Sistema de Biblioteca - Spring Boot API

## Instalación y Ejecución

### Prerrequisitos
- Java 17 o superior
- El proyecto incluye Maven Wrapper (no necesitas instalar Maven)

### Pasos para ejecutar

1. Navegar al directorio del proyecto:
   ```bash
   cd spring-backend-1758948241753
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


### Libro

- GET /api/libro - Obtener todos los registros
- GET /api/libro/{id} - Obtener registro por ID
- POST /api/libro - Crear nuevo registro
- PUT /api/libro/{id} - Actualizar registro completo
- PATCH /api/libro/{id} - Actualizar registro parcial
- DELETE /api/libro/{id} - Eliminar registro
- GET /api/libro/count - Contar registros
### Usuario

- GET /api/usuario - Obtener todos los registros
- GET /api/usuario/{id} - Obtener registro por ID
- POST /api/usuario - Crear nuevo registro
- PUT /api/usuario/{id} - Actualizar registro completo
- PATCH /api/usuario/{id} - Actualizar registro parcial
- DELETE /api/usuario/{id} - Eliminar registro
- GET /api/usuario/count - Contar registros

## Pruebas con Postman

### Configuración básica
1. Abre Postman
2. Crea una nueva colección
3. Configura la variable de entorno `baseUrl` con el valor: `http://localhost:8080/api`

### Ejemplos de Pruebas


#### Libro - Ejemplos de Pruebas

**1. Obtener todos los libro**
- Método: GET
- URL: `{{baseUrl}}/libro`
- Headers: Ninguno
- Respuesta esperada: Lista de registros (puede estar vacía)

**2. Crear nuevo libro**
- Método: POST
- URL: `{{baseUrl}}/libro`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "nombre": "Ejemplo Libro",
  "descripcion": "Descripción de ejemplo"
}
```
- Respuesta esperada: 201 Created con el objeto creado

**3. Obtener libro por ID**
- Método: GET
- URL: `{{baseUrl}}/libro/1`
- Headers: Ninguno
- Respuesta esperada: 200 OK con el objeto o 404 Not Found

**4. Actualizar libro completamente**
- Método: PUT
- URL: `{{baseUrl}}/libro/1`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "id": 1,
  "nombre": "Libro Actualizado",
  "descripcion": "Descripción actualizada"
}
```
- Respuesta esperada: 200 OK con el objeto actualizado

**5. Actualizar libro parcialmente**
- Método: PATCH
- URL: `{{baseUrl}}/libro/1`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "nombre": "Libro Parcialmente Actualizado"
}
```
- Respuesta esperada: 200 OK con el objeto parcialmente actualizado

**6. Eliminar libro**
- Método: DELETE
- URL: `{{baseUrl}}/libro/1`
- Headers: Ninguno
- Respuesta esperada: 204 No Content

**7. Contar libro**
- Método: GET
- URL: `{{baseUrl}}/libro/count`
- Headers: Ninguno
- Respuesta esperada: 200 OK con el número total de registros
#### Usuario - Ejemplos de Pruebas

**1. Obtener todos los usuario**
- Método: GET
- URL: `{{baseUrl}}/usuario`
- Headers: Ninguno
- Respuesta esperada: Lista de registros (puede estar vacía)

**2. Crear nuevo usuario**
- Método: POST
- URL: `{{baseUrl}}/usuario`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "nombre": "Ejemplo Usuario",
  "descripcion": "Descripción de ejemplo"
}
```
- Respuesta esperada: 201 Created con el objeto creado

**3. Obtener usuario por ID**
- Método: GET
- URL: `{{baseUrl}}/usuario/1`
- Headers: Ninguno
- Respuesta esperada: 200 OK con el objeto o 404 Not Found

**4. Actualizar usuario completamente**
- Método: PUT
- URL: `{{baseUrl}}/usuario/1`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "id": 1,
  "nombre": "Usuario Actualizado",
  "descripcion": "Descripción actualizada"
}
```
- Respuesta esperada: 200 OK con el objeto actualizado

**5. Actualizar usuario parcialmente**
- Método: PATCH
- URL: `{{baseUrl}}/usuario/1`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "nombre": "Usuario Parcialmente Actualizado"
}
```
- Respuesta esperada: 200 OK con el objeto parcialmente actualizado

**6. Eliminar usuario**
- Método: DELETE
- URL: `{{baseUrl}}/usuario/1`
- Headers: Ninguno
- Respuesta esperada: 204 No Content

**7. Contar usuario**
- Método: GET
- URL: `{{baseUrl}}/usuario/count`
- Headers: Ninguno
- Respuesta esperada: 200 OK con el número total de registros

### Flujo de Pruebas Recomendado
1. Crear un nuevo registro con POST
2. Obtener el registro creado con GET por ID
3. Actualizar completamente con PUT
4. Actualizar parcialmente con PATCH
5. Obtener todos los registros con GET
6. Contar registros con GET /count
7. Eliminar el registro con DELETE
8. Verificar que fue eliminado con GET por ID (debe devolver 404)

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
- Libro
- Usuario

### Operaciones CRUD Disponibles
- GET /api/{entidad} - Obtener todos
- GET /api/{entidad}/{id} - Obtener por ID
- POST /api/{entidad} - Crear nuevo
- PUT /api/{entidad}/{id} - Actualizar completo
- PATCH /api/{entidad}/{id} - Actualizar parcial
- DELETE /api/{entidad}/{id} - Eliminar
- GET /api/{entidad}/count - Contar registros