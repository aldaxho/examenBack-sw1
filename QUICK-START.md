# 🚀 Inicio Rápido - Deployment

## Configuración Rápida para Producción

### 1️⃣ Preparar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env
```

### 2️⃣ Verificar Configuración

```bash
npm run check
```

Si todo está bien, verás: ✅ CONFIGURACIÓN CORRECTA

### 3️⃣ Migrar Base de Datos

```bash
NODE_ENV=production npm run db:migrate:prod
```

### 4️⃣ Iniciar en Producción

**Opción A: DigitalOcean App Platform**
- Push a GitHub
- Conecta en DigitalOcean
- Configura variables de entorno
- Deploy automático ✨

**Opción B: PM2 (VPS/Droplet)**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📚 Documentación Completa

Para instrucciones detalladas paso a paso, consulta:

👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de deployment

---

## ✅ Checklist Rápido

- [ ] Base de datos PostgreSQL configurada
- [ ] Variables de entorno en `.env`
- [ ] `npm run check` sin errores
- [ ] Migraciones ejecutadas
- [ ] Backend desplegado
- [ ] CORS configurado con frontend
- [ ] SSL habilitado (HTTPS)

---

## 🆘 Problemas Comunes

**"Cannot connect to database"**
→ Verifica DB_HOST, DB_PORT, DB_SSL=true

**"CORS policy error"**
→ Agrega tu dominio del frontend en `index.js`

**"JWT invalid"**
→ Asegúrate que JWT_SECRET sea el mismo

---

## 📞 Ayuda

Consulta [DEPLOYMENT.md](./DEPLOYMENT.md) para troubleshooting completo.
