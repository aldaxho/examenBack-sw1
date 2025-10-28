class ApiConfig {
  // URL base del backend Spring Boot
  static const String baseUrl = 'http://localhost:8080/api';
  
  // Para dispositivos físicos, usar la IP de tu computadora:
  // static const String baseUrl = 'http://192.168.1.100:8080/api';
  
  // Timeout para las peticiones HTTP
  static const Duration timeout = Duration(seconds: 30);
  
  // Headers por defecto
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}