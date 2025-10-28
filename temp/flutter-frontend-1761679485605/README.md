# pruebajorge - Flutter Frontend

## 📱 Descripción

Frontend móvil para sistema de gestión empresarial generado automáticamente desde diagrama UML.

## 🚀 Características

- ✅ **CRUD Completo**: Gestión completa de todas las entidades
- ✅ **Navegación**: Entre pantallas de diferentes entidades
- ✅ **Formularios**: Validación y envío de datos
- ✅ **Listas**: Visualización de datos con paginación
- ✅ **Búsqueda**: Filtrado y búsqueda de registros
- ✅ **Estados**: Manejo de estados de carga y error
- ✅ **Responsive**: Adaptado a diferentes tamaños de pantalla
- ✅ **Temas**: Modo claro y oscuro
- ✅ **Conexión Automática**: Conectado al backend Spring Boot

## 📋 Prerrequisitos

- Flutter SDK 3.0 o superior
- Dart SDK 3.0 o superior
- Android Studio / VS Code con extensiones Flutter
- Backend Spring Boot ejecutándose en puerto 8080

## 🛠️ Instalación

### ⚠️ IMPORTANTE - Pasos en orden:

1. **Obtener dependencias**:
   ```bash
   flutter pub get
   ```

2. **Generar archivos de serialización JSON** (OBLIGATORIO):
   
   Los modelos usan `json_serializable` y necesitan generar archivos `.g.dart`:
   
   ```bash
   # Opción 1: Generar una vez
   flutter pub run build_runner build
   
   # Opción 2: Generar y eliminar conflictos
   flutter pub run build_runner build --delete-conflicting-outputs
   
   # Opción 3: Generar en modo watch (regenera automáticamente)
   flutter pub run build_runner watch
   ```
   
   ⚠️ **Sin este paso, verás errores de "part not found" y métodos no definidos**

3. **Verificar backend**:
   
   Asegúrate de que el backend Spring Boot esté ejecutándose:
   ```bash
   cd ../backend
   ./mvnw spring-boot:run
   ```
   
   El backend debe estar corriendo en `http://localhost:8080`

4. **Ejecutar la aplicación**:
   
   ```bash
   # En navegador Chrome
   flutter run -d chrome
   
   # En dispositivo Android conectado
   flutter run -d android
   
   # En emulador Android
   flutter run
   
   # Listar dispositivos disponibles
   flutter devices
   ```

## 🔧 Solución de Problemas Comunes

### Error: "part '*.g.dart' not found"
**Causa**: No se han generado los archivos de serialización JSON.

**Solución**:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Error: "Build failed due to use of deleted Android v1 embedding"
**Causa**: Configuración de Android obsoleta.

**Solución**: Este proyecto ya usa Android v2 embedding. Si ves este error:
1. Elimina las carpetas `android/` e `ios/`
2. Regenera el proyecto con Flutter:
   ```bash
   flutter create --org com.example .
   ```
3. Vuelve a generar los archivos `.g.dart`:
   ```bash
   flutter pub get
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

### Error: CardTheme vs CardThemeData
**Causa**: Incompatibilidad de versión de Flutter.

**Solución**: El archivo `lib/config/app_theme.dart` usa `CardThemeData` que es compatible con Flutter 3.0+.
```bash
flutter upgrade
```

### Error de conexión al backend
**Causa**: Backend no está ejecutándose o URL incorrecta.

**Solución**:
1. Verifica que el backend esté corriendo: `curl http://localhost:8080/api`
2. Para dispositivos físicos, usa la IP de tu PC en `lib/config/api_config.dart`:
   ```dart
   static const String baseUrl = 'http://192.168.1.X:8080/api';
   ```
3. Asegúrate de que el firewall permita conexiones al puerto 8080

## 🔗 Configuración de Conexión

El frontend está configurado para conectarse automáticamente al backend Spring Boot.

### Archivo de configuración: `lib/config/api_config.dart`

```dart
class ApiConfig {
  static const String baseUrl = 'http://localhost:8080/api';
}
```

### Para dispositivos físicos:
Cambiar la URL por la IP de tu computadora:

```dart
static const String baseUrl = 'http://192.168.1.100:8080/api';
```

## 📱 Pantallas Disponibles


### Cliente
- **Lista**: `ClienteListScreen` - Visualización de todos los registros
- **Formulario**: `ClienteFormScreen` - Crear/editar registros
- **Detalle**: `ClienteDetailScreen` - Ver detalles de un registro

### Categoria
- **Lista**: `CategoriaListScreen` - Visualización de todos los registros
- **Formulario**: `CategoriaFormScreen` - Crear/editar registros
- **Detalle**: `CategoriaDetailScreen` - Ver detalles de un registro

### Producto
- **Lista**: `ProductoListScreen` - Visualización de todos los registros
- **Formulario**: `ProductoFormScreen` - Crear/editar registros
- **Detalle**: `ProductoDetailScreen` - Ver detalles de un registro

### Pedido
- **Lista**: `PedidoListScreen` - Visualización de todos los registros
- **Formulario**: `PedidoFormScreen` - Crear/editar registros
- **Detalle**: `PedidoDetailScreen` - Ver detalles de un registro

### DetallePedido
- **Lista**: `DetallePedidoListScreen` - Visualización de todos los registros
- **Formulario**: `DetallePedidoFormScreen` - Crear/editar registros
- **Detalle**: `DetallePedidoDetailScreen` - Ver detalles de un registro


## 🏗️ Arquitectura

```
lib/
├── config/           # Configuración de la app
│   ├── api_config.dart
│   └── app_theme.dart
├── models/           # Modelos de datos
│   └── *.dart
├── services/         # Servicios API
│   ├── *_service.dart
│   ├── http_service.dart
│   └── navigation_service.dart
├── screens/          # Pantallas de la app
│   ├── home_screen.dart
│   └── *_*_screen.dart
├── widgets/          # Widgets reutilizables
└── main.dart         # Punto de entrada
```

## 🧪 Testing

```bash
# Ejecutar tests
flutter test

# Ejecutar tests con cobertura
flutter test --coverage
```

## 📦 Build

### Android APK
```bash
flutter build apk --release
```

### iOS (requiere macOS)
```bash
flutter build ios --release
```

### Web
```bash
flutter build web --release
```

## 🔧 Configuración Avanzada

### Cambiar Puerto del Backend
1. Modificar `lib/config/api_config.dart`
2. Cambiar `baseUrl` al nuevo puerto

### Personalizar Tema
Editar `lib/config/app_theme.dart` para personalizar colores, fuentes, etc.

### Agregar Nuevas Funcionalidades
1. Crear modelo en `lib/models/`
2. Crear servicio en `lib/services/`
3. Crear pantallas en `lib/screens/`
4. Actualizar navegación en `lib/screens/home_screen.dart`

## 🆘 Solución de Problemas

### Error de conexión
- Verificar que el backend esté ejecutándose
- Verificar la URL en `api_config.dart`
- Verificar conectividad de red

### Error de compilación
```bash
flutter clean
flutter pub get
flutter packages pub run build_runner build --delete-conflicting-outputs
```

### Error de dependencias
```bash
flutter pub deps
flutter pub upgrade
```

## 📚 Dependencias Principales

- **http**: Peticiones HTTP al backend
- **json_annotation**: Serialización JSON
- **provider**: Gestión de estado
- **intl**: Internacionalización

---

**Frontend generado automáticamente desde diagrama UML**
**Fecha de generación**: 28/10/2025, 3:24:45 p. m.
**Entidades incluidas**: Cliente, Categoria, Producto, Pedido, DetallePedido
**Backend conectado**: http://localhost:8080/api
