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

// Crear el servidor HTTP
const server = http.createServer(app);

// Almacén de usuarios conectados por sala (para colaboración en tiempo real)
const onlineUsers = new Map(); // roomId -> Map(socketId -> userData)

// Obtener lista de usuarios conectados en una sala
function getOnlineUsersInRoom(roomId) {
  const roomUsers = onlineUsers.get(roomId);
  if (!roomUsers) return [];
  return Array.from(roomUsers.values());
}

// Configuración de CORS (permisos para el frontend)
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://18.223.131.235:3000',
    'https://diagramador1.netlify.app',
    'https://157-245-1-74.sslip.io'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilitar preflight
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Socket.IO para colaboración en tiempo real
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://18.223.131.235:3000',
      'https://diagramador1.netlify.app',
      'https://157-245-1-74.sslip.io'
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Configuración de eventos de Socket.IO para colaboración en tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Autenticación opcional del socket usando JWT
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
      // Si el token es inválido, permitir conexión sin autenticación
    }
    next();
  });

  // Cuando un usuario se une a una sala (diagrama)
  socket.on('join-room', (roomId, callback) => {
    try {
      // Unir el socket a la sala
      socket.join(roomId);
      socket.roomId = roomId;
      
      // Crear la sala si no existe
      if (!onlineUsers.has(roomId)) {
        onlineUsers.set(roomId, new Map());
      }
      
      // Registrar al usuario en la lista de conectados
      const roomUsers = onlineUsers.get(roomId);
      const userData = {
        socketId: socket.id,
        userId: socket.userId || socket.id,
        username: socket.username || `Usuario-${socket.id.substring(0, 8)}`
      };
      roomUsers.set(socket.id, userData);
      
      console.log(`Usuario ${userData.username} se unió a la sala: ${roomId}`);
      
      const onlineUsersArray = getOnlineUsersInRoom(roomId);
      
      // Notificar a otros usuarios que alguien se unió
      socket.to(roomId).emit('user-joined', {
        userId: userData.userId,
        username: userData.username,
        socketId: socket.id
      });
      
      // Enviar lista actualizada de usuarios
      socket.to(roomId).emit('presence-update', { onlineUsers: onlineUsersArray });
      socket.emit('online-users', onlineUsersArray);
      
      // Responder al cliente que se unió
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

  // Evento alternativo para unirse a un diagrama (similar a join-room)
  socket.on('join-diagram', (payload, callback) => {
    try {
      const roomId = typeof payload === 'string' ? payload : (payload && payload.roomId);
      if (!roomId) {
        if (callback) callback({ error: 'roomId requerido' });
        return;
      }
      
      socket.join(roomId);
      socket.roomId = roomId;

      if (!onlineUsers.has(roomId)) {
        onlineUsers.set(roomId, new Map());
      }

      const roomUsers = onlineUsers.get(roomId);
      const userData = {
        socketId: socket.id,
        userId: socket.userId || socket.id,
        username: socket.username || `Usuario-${socket.id.substring(0, 8)}`
      };
      roomUsers.set(socket.id, userData);

      const onlineUsersArray = getOnlineUsersInRoom(roomId);

      socket.to(roomId).emit('user-joined', {
        userId: userData.userId,
        username: userData.username,
        socketId: socket.id
      });
      socket.to(roomId).emit('presence-update', { onlineUsers: onlineUsersArray });
      socket.emit('online-users', onlineUsersArray);

      if (callback) {
        callback({ onlineUsers: onlineUsersArray });
      }
    } catch (error) {
      console.error('Error en join-diagram:', error);
      if (callback) {
        callback({ error: 'Error al unirse al diagrama' });
      }
    }
  });

  // Obtener lista de usuarios conectados en una sala
  socket.on('get-online-users', (roomId, callback) => {
    try {
      const users = getOnlineUsersInRoom(roomId);
      if (callback) {
        callback({ users });
      }
      socket.emit('online-users', users);
    } catch (error) {
      console.error('Error al obtener usuarios en línea:', error);
      if (callback) {
        callback({ error: 'Error al obtener usuarios' });
      }
    }
  });

  // Cuando alguien actualiza el diagrama completo
  socket.on('update-diagram', (data) => {
    const { roomId, diagram } = data;
    socket.to(roomId).emit('diagram-updated', diagram);
  });

  // Cuando alguien mueve una clase en el canvas
  socket.on('move-class', (data) => {
    const { roomId, classId, position } = data;
    socket.to(roomId).emit('class-moved', { classId, position });
  });

  // Movimiento del cursor del mouse (para ver donde trabajan otros usuarios)
  socket.on('mouse-move', (data) => {
    const { roomId, mouseX, mouseY } = data;
    socket.to(roomId).emit('mouse-moved', { 
      mouseX, 
      mouseY, 
      userId: socket.userId || socket.id,
      username: socket.username || `Usuario-${socket.id.substring(0, 8)}`
    });
  });

  // Eventos de clases
  socket.on('add-class', (data) => {
    const { roomId, newClass } = data;
    socket.to(roomId).emit('class-added', { newClass });
  });

  socket.on('update-class', (data) => {
    const { roomId, classId, updatedData } = data;
    socket.to(roomId).emit('class-updated', { classId, updatedData });
  });

  socket.on('delete-class', (data) => {
    const { roomId, classId } = data;
    socket.to(roomId).emit('class-deleted', { classId });
  });

  // Eventos de relaciones
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

  // Cuando un usuario se desconecta
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    
    try {
      // Remover usuario de la sala
      if (socket.roomId && onlineUsers.has(socket.roomId)) {
        const roomUsers = onlineUsers.get(socket.roomId);
        const userData = roomUsers.get(socket.id);
        
        if (userData) {
          // Notificar a otros usuarios
          socket.to(socket.roomId).emit('user-left', {
            userId: userData.userId,
            username: userData.username,
            socketId: socket.id
          });
          
          // Eliminar de la lista
          roomUsers.delete(socket.id);
          
          // Si la sala quedó vacía, eliminarla
          if (roomUsers.size === 0) {
            onlineUsers.delete(socket.roomId);
          }

          // Enviar lista actualizada
          const onlineUsersArray = getOnlineUsersInRoom(socket.roomId);
          socket.to(socket.roomId).emit('presence-update', { onlineUsers: onlineUsersArray });
          socket.to(socket.roomId).emit('online-users', onlineUsersArray);
        }
      }
    } catch (error) {
      console.error('Error al manejar desconexión:', error);
    }
  });
});


// Conectar a la base de datos
const { sequelize } = require('./models');

sequelize
  .authenticate()
  .then(() => {
    console.log('Conectado a la base de datos');
    // Iniciar limpieza automática de archivos temporales
    startCleanupScheduler();
  })
  .catch((err) => console.error('Error de conexión:', err));

// Rutas de la API
app.get('/', (req, res) => {
  res.send('API en funcionamiento');
});

app.use('/api/auth', authRoutes);
app.use('/api/openapi', openapiRoutes);
app.use('/api/diagramas', verificarToken, diagramaRoutes);
app.use('/api/invitations', invitationsRoutes);

// Hacer Socket.IO accesible desde las rutas
app.use((req, res, next) => {
  req.app.set('io', io);
  next();
});

app.use('/api/assistant', verificarToken, require('./routes/assistantRoutes'));

// Utilidad para el frontend
app.get('/api/utils/canvas-autofit', (req, res) => {
  const filePath = path.join(__dirname, 'utils', 'canvasAutoFit.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(filePath);
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
