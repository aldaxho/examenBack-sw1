# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**examenBack-sw1** is a Node.js/Express REST API that generates full-stack projects (Spring Boot + Flutter) from UML diagrams. The system includes real-time collaboration via Socket.IO, JWT authentication, and automatic code generation.

## Quick Start Commands

### Development
```bash
npm run dev          # Start with nodemon (recommended for development)
npm install          # Install dependencies
```

### Database
```bash
npm run db:create    # Create the database (first time only)
npm run db:migrate   # Run pending migrations
npm run db:migrate:undo  # Undo last migration
npm start            # Production mode
```

### Production
```bash
set NODE_ENV=production && npm run db:migrate  # Run migrations in production
npm start            # Start in production mode
```

## Architecture

### Core Stack
- **Framework**: Express.js (HTTP server)
- **Real-time**: Socket.IO (WebSockets for collaboration)
- **Database**: PostgreSQL (via Sequelize ORM)
- **Authentication**: JWT tokens with bcryptjs
- **Code Generation**: Custom generators for Spring Boot and Flutter
- **File Handling**: Archiver (ZIP compression), adm-zip

### Directory Structure
```
controllers/          # Request handlers
  ├── authController.js         # Login, register, profile
  ├── diagramaController.js      # Diagram CRUD
  ├── openapiController.js       # Spring Boot/Flutter generation
  ├── flutterController.js       # Flutter-specific generation
  ├── assistantController.js     # AI assistant for diagram analysis
  └── invitacionController.js    # Invitation system

models/              # Sequelize ORM models
  ├── usuario.js                 # User model
  ├── diagrama.js                # Diagram model
  ├── DiagramaUsuario.js         # Many-to-many relationship
  └── index.js                   # Sequelize configuration

routes/              # API endpoints
  ├── authRoutes.js              # /api/auth/*
  ├── diagramaRoutes.js          # /api/diagramas/* (protected)
  ├── openapiRoutes.js           # /api/openapi/*
  ├── assistantRoutes.js         # /api/assistant/* (protected)
  └── invitationsRoutes.js       # /api/invitations/*

middleware/          # Express middleware
  └── authMiddleware.js          # JWT verification (verificarToken)

utils/               # Utility functions
  ├── simpleSpringBootGenerator.js  # Generates Spring Boot projects
  ├── flutterGenerator.js           # Generates Flutter apps
  ├── createHomeScreen.js           # Flutter home screen generator
  ├── tempCleaner.js                # Scheduled temp file cleanup
  └── canvasAutoFit.js              # Frontend canvas utilities

migrations/          # Database migrations
  ├── *-create-usuario.js
  ├── *-create-diagrama.js
  └── *-create-diagrama-usuarios.js

config/
  └── config.json    # Database configuration for Sequelize CLI
```

## Key Concepts

### Socket.IO Events (Real-time Collaboration)
**Room Management:**
- `join-diagram` / `join-room` - User joins a diagram editing room
- `user-joined` - Broadcast when user joins
- `user-left` / `disconnect` - User leaves the room
- `presence-update` - Online users list update
- `online-users` - Get current online users

**Diagram Operations:**
- `update-diagram` - Full diagram update
- `add-class`, `update-class`, `delete-class`
- `add-relation`, `update-relation`, `delete-relation`
- `move-class` - Move a class on the canvas
- `mouse-move` - User cursor position

**Implementation**: Main Socket.IO logic is in `index.js:75-301`. Each event includes `roomId` to isolate collaboration per diagram.

### Authentication Pattern
- **Token-based**: JWT stored in `Authorization: Bearer <token>` header
- **Middleware**: `verificarToken()` in `authMiddleware.js` validates tokens
- **Protected routes**: `/api/diagramas`, `/api/assistant` require valid JWT
- **Public routes**: `/api/auth/register`, `/api/auth/login`, `/api/openapi/download`

### Code Generation Pipeline
1. **UML Parsing**: Diagram stored in database (`diagrama.contenido` = JSON with classes/relations)
2. **Spring Boot Generation**: `simpleSpringBootGenerator.js` creates Java entities, services, controllers
3. **Flutter Generation**: `flutterGenerator.js` creates Dart models, services, screens
4. **ZIP Creation**: Both projects zipped and served for download
5. **Cleanup**: `tempCleaner.js` runs on schedule to remove temp files

### Environment Variables
**Required** (.env file):
- `PORT` - Express server port (default: 3001)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL
- `JWT_SECRET` - Secret for JWT signing

**Optional**:
- `NODE_ENV` - "development" or "production" (affects DB config used)
- `OPENAI_API_KEY` - For AI assistant features
- `AGENT_URL`, `AGENT_TOKEN` - For AI agent integration
- `FRONT_ORIGIN` - CORS origin for frontend (default: localhost:3000)

**Production Note**: For DigitalOcean deployment, `config/config.json` has production credentials. Use `set NODE_ENV=production` or export to switch configs.

## Common Development Tasks

### Adding a New API Endpoint
1. Create controller method in `controllers/<name>Controller.js`
2. Define route in `routes/<name>Routes.js`
3. Mount route in `index.js` via `app.use('/api/<path>', route)`
4. Add JWT verification if protected: `router.use(verificarToken)` at top of route file

### Modifying Database Schema
1. Create migration: `npx sequelize-cli migration:generate --name <description>`
2. Edit migration file in `migrations/`
3. Update model in `models/<modelName>.js` to match
4. Run migration: `npm run db:migrate`
5. To revert: `npm run db:migrate:undo`

### Adding Socket.IO Events
1. Add listener in `index.js` socket handler (after line 75)
2. Emit to specific room: `socket.to(roomId).emit('event-name', data)`
3. Broadcast to sender: `socket.emit('event-name', data)`
4. Track room state in `onlineUsers` Map if needed

### Generating Code Examples
- **Spring Boot**: Uses Java 17+ templates for entities, services, controllers with JPA annotations
- **Flutter**: Uses Dart 3.0+ with json_serializable and Provider for state management
- Both include README files and are immediately runnable after generation

## Testing & Deployment

### Local Testing
```bash
npm run dev              # Start development server
# Visit http://localhost:3001
# Database uses local credentials from .env
```

### Database Troubleshooting
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# If migrations fail, reset locally (dev only!)
npm run db:drop && npm run db:create && npm run db:migrate
```

### Production Deployment
- Configured for **DigitalOcean App Platform** + PostgreSQL cluster
- Uses PM2 for process management (see README for setup)
- Nginx proxy configuration included in README
- SSL via Let's Encrypt (Certbot)
- Database connection requires SSL on production (DB_SSL=true)

## Important Notes

- **CORS Configuration**: Hardcoded in `index.js:38-49` (multiple origins). Update before production.
- **Temporary Files**: Generated projects stored in `/temp` directory, auto-cleaned by `tempCleaner.js`
- **Socket.IO Namespaces**: Not used; events scoped by `roomId` parameter instead
- **Sensitive Data**: `.env` file excluded from git (should be). Production credentials in `config.json` need rotation.
- **Token Expiry**: JWT tokens don't expire in current implementation; consider adding expiration for security
- **Many-to-Many**: Users and Diagrams use `DiagramaUsuario` join table for relationships

## Common Patterns in Codebase

### Error Handling
Most controllers use try-catch with `res.status().json({ error: 'message' })`

### Response Format
Success: `res.status(200).json({ data: {...} })`
Error: `res.status(400).json({ error: 'message' })`

### Database Queries
Uses Sequelize async/await pattern: `await Model.findByPk()`, `await Model.create()`, etc.

### File Operations
- ZIP creation: Uses `archiver` library
- ZIP reading: Uses `adm-zip` library
- Files generated in `./temp/` with cleanup scheduler
