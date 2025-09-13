const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const invitationsRoutes = require('./routes/invitationsRoutes');
const diagramaRoutes = require('./routes/diagramaRoutes');
const openapiRoutes = require('./routes/openapiRoutes');
const { verificarToken } = require('./middleware/authMiddleware');
const { Usuario } = require('./models');
const { startCleanupScheduler } = require('./utils/tempCleaner');
const socketIo = require('socket.io');
const http = require('http');
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
// Crear el servidor HTTP a partir de la aplicación Express
const server = http.createServer(app);

// Sistema para rastrear usuarios en línea por sala
const onlineUsers = new Map(); // roomId -> Map(socketId -> userData)

// Función auxiliar para obtener usuarios en línea en una sala
function getOnlineUsersInRoom(roomId) {
  const roomUsers = onlineUsers.get(roomId);
  if (!roomUsers) return [];
  
  return Array.from(roomUsers.values());
}

// Configuración de CORS para Express
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://18.223.131.235:3000'], // Permite solicitudes solo desde tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Permite el envío de credenciales (cookies, headers de autenticación)
}));
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Socket.IO con CORS
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST","PUT","DELETE"]
  }
});

// Manejo de sockets para colaboración en tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Middleware para autenticación de socket (opcional)
  socket.use(async (packet, next) => {
    try {
      const token = packet[1]?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Usuario.findByPk(decoded.id);
        if (user) {
          socket.userId = user.id;
          socket.username = user.nombre;
        }
      }
    } catch (error) {
      // Token inválido, pero permitir conexión sin autenticación
    }
    next();
  });

  // Al unirse a una sala
  socket.on('join-room', (roomId, callback) => {
    try {
      // Agregar usuario a la sala
      socket.join(roomId);
      socket.roomId = roomId;
      
      // Inicializar la sala si no existe
      if (!onlineUsers.has(roomId)) {
        onlineUsers.set(roomId, new Map());
      }
      
      // Agregar usuario a la lista de usuarios en línea
      const roomUsers = onlineUsers.get(roomId);
      const userData = {
        socketId: socket.id,
        userId: socket.userId || socket.id,
        username: socket.username || `Usuario-${socket.id.substring(0, 8)}`
      };
      roomUsers.set(socket.id, userData);
      
      console.log(`Usuario ${userData.username} se unió a la sala: ${roomId}`);
      
      // Obtener usuarios conectados en la sala
      const onlineUsersArray = getOnlineUsersInRoom(roomId);
      
      // Notificar a otros usuarios
      socket.to(roomId).emit('user-joined', {
        userId: userData.userId,
        username: userData.username,
        socketId: socket.id
      });
      
      // Responder con usuarios conectados
      if (callback) {
        callback({ onlineUsers: onlineUsersArray });
      }
    } catch (error) {
      console.error('Error en join-room:', error);
      if (callback) {
        callback({ error: 'Error al unirse a la sala' });
      }
    }
  });

  // Solicitar usuarios en línea
  socket.on('get-online-users', (roomId, callback) => {
    try {
      const users = getOnlineUsersInRoom(roomId);
      if (callback) {
        callback({ users });
      }
    } catch (error) {
      console.error('Error al obtener usuarios en línea:', error);
      if (callback) {
        callback({ error: 'Error al obtener usuarios' });
      }
    }
  });

  // Manejo de actualizaciones del diagrama
  socket.on('update-diagram', (data) => {
    const { roomId, diagram } = data;
    // Emitir el diagrama actualizado a todos los usuarios en la sala, excepto al que lo envió
    socket.to(roomId).emit('diagram-updated', diagram);
  });

  socket.on('move-class', (data) => {
    const { roomId, classId, position } = data;
    socket.to(roomId).emit('class-moved', { classId, position });
  });

  // Manejo de movimiento del mouse
  socket.on('mouse-move', (data) => {
    const { roomId, mouseX, mouseY } = data;
    socket.to(roomId).emit('mouse-moved', { 
      mouseX, 
      mouseY, 
      userId: socket.userId || socket.id,
      username: socket.username || `Usuario-${socket.id.substring(0, 8)}`
    });
  });

  // Manejar agregar clase
  socket.on('add-class', (data) => {
    const { roomId, newClass } = data;
    socket.to(roomId).emit('class-added', { newClass });
  });

  // Manejar actualizar clase
  socket.on('update-class', (data) => {
    const { roomId, classId, updatedData } = data;
    socket.to(roomId).emit('class-updated', { classId, updatedData });
  });

  // Manejar eliminar clase
  socket.on('delete-class', (data) => {
    const { roomId, classId } = data;
    socket.to(roomId).emit('class-deleted', { classId });
  });

  // Manejar relaciones
  socket.on('add-relation', (data) => {
    const { roomId, newRelation } = data;
    socket.to(roomId).emit('relation-added', { newRelation });
  });

  socket.on('update-relation', (data) => {
    const { roomId, relationId, updatedData } = data;
    socket.to(roomId).emit('relation-updated', { relationId, updatedData });
  });

  socket.on('delete-relation', (data) => {
    const { roomId, relationId } = data;
    socket.to(roomId).emit('relation-deleted', { relationId });
  });

  // Al desconectarse
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    
    try {
      // Remover usuario de todas las salas
      if (socket.roomId && onlineUsers.has(socket.roomId)) {
        const roomUsers = onlineUsers.get(socket.roomId);
        const userData = roomUsers.get(socket.id);
        
        if (userData) {
          // Notificar que el usuario se desconectó
          socket.to(socket.roomId).emit('user-left', {
            userId: userData.userId,
            username: userData.username,
            socketId: socket.id
          });
          
          // Remover de la lista de usuarios en línea
          roomUsers.delete(socket.id);
          
          // Si la sala está vacía, eliminarla
          if (roomUsers.size === 0) {
            onlineUsers.delete(socket.roomId);
          }
        }
      }
    } catch (error) {
      console.error('Error al manejar desconexión:', error);
    }
  });
});



// Conectar a la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Conectado a la base de datos');
    // Iniciar limpieza automática de archivos temporales
    startCleanupScheduler();
  })
  .catch((err) => console.error('Error de conexión:', err));

// Ruta base
app.get('/', (req, res) => {
  res.send('API en funcionamiento');
});
// Rutas de autenticación
app.use('/api/auth', authRoutes);
// Rutas de OpenAPI Generator (generador confiable)
app.use('/api/openapi', openapiRoutes);
// Rutas de diagramas protegidas
app.use('/api/diagramas', verificarToken, diagramaRoutes);
app.use('/api/invitations', invitationsRoutes);

// Middleware para pasar Socket.IO a las rutas
app.use((req, res, next) => {
  req.app.set('io', io);
  next();
});

app.use('/api/assistant', verificarToken, require('./routes/assistantRoutes'));

// Servir utilidades para el frontend
app.get('/api/utils/canvas-autofit', (req, res) => {
  const filePath = path.join(__dirname, 'utils', 'canvasAutoFit.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(filePath);
});
// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
