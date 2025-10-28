````markdown
# Problema con Maven y Soluciones Prácticas

## 🔴 PROBLEMA IDENTIFICADO

### ¿Por qué falla después de reiniciar?

**Causa raíz:** El Maven Wrapper (`mvnw`) intentar descargar Maven automáticamente, pero:

1. **Maven JAR no está incluido** en el ZIP descargado
   - Archivo esperado: `.mvn/wrapper/maven-wrapper.jar` (~1.5 MB)
   - Estado actual: No existe o está corrupto

2. **Sin conexión a internet** no puede descargar automáticamente
   - El wrapper intenta descargar de: `https://repo.maven.apache.org/maven2/...`
   - Si falla, muestra error: `Could not find or load main class org.apache.maven.wrapper.MavenWrapperMain`

3. **Sin Maven global instalado** no tiene alternativa
   - Windows: No tienes `mvn` en PATH
   - El sistema no puede ejecutar ningún comando Maven

### Error típico que ves:
```
Error: Could not find or load main class org.apache.maven.wrapper.MavenWrapperMain
```

---

## ✅ SOLUCIÓN INMEDIATA (Para tu backend actual)

### Opción 1: Reparar Maven Wrapper (3 minutos)

**Windows PowerShell:**
```powershell
# Abre PowerShell en la carpeta del backend
cd C:\ruta\a\tu\backend

# Ejecuta este comando para reparar
if (!(Test-Path ".mvn\wrapper\maven-wrapper.jar") -or (Get-Item ".mvn\wrapper\maven-wrapper.jar").Length -lt 50000) {
    Write-Host "Reparando Maven Wrapper..." -ForegroundColor Yellow
    Remove-Item ".mvn\wrapper\maven-wrapper.jar" -Force -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Path ".mvn\wrapper" -Force | Out-Null
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -OutFile ".mvn\wrapper\maven-wrapper.jar"
    Write-Host "Maven Wrapper reparado ✓" -ForegroundColor Green
}

# Verificar que se descargó correctamente
(Get-Item ".mvn\wrapper\maven-wrapper.jar").Length
```

**Linux/Mac:**
```bash
cd /ruta/a/tu/backend

if [ ! -f ".mvn/wrapper/maven-wrapper.jar" ] || [ $(stat -f%z ".mvn/wrapper/maven-wrapper.jar") -lt 50000 ]; then
    echo "Reparando Maven Wrapper..."
    rm -f ".mvn/wrapper/maven-wrapper.jar"
    mkdir -p ".mvn/wrapper"
    curl -L "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar" -o ".mvn/wrapper/maven-wrapper.jar"
    echo "Maven Wrapper reparado ✓"
fi

# Verificar que se descargó correctamente (debe ser >= 1.5 MB)
ls -lh ".mvn/wrapper/maven-wrapper.jar"
```

### Después de reparar, ejecuta:
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

---

### Opción 2: Instalar Maven globalmente (5 minutos)

Si quieres más control y no depender del wrapper:

**Windows (con Chocolatey):**
```powershell
# Instalar Chocolatey si no lo tienes
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Instalar Maven
choco install maven -y

# Verificar instalación
mvn --version
```

... (rest of document preserved)

````markdown
