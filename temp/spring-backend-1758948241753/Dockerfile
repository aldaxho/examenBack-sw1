# Usar imagen base de OpenJDK 17
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
ENV SPRING_PROFILES_ACTIVE=prod