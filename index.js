const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const diagramaRoutes = require('./routes/diagramaRoutes');
const { verificarToken } = require('./middleware/authMiddleware');
const socketIo = require('socket.io');
const http = require('http'); // Importar el módulo HTTP
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
// Crear el servidor HTTP a partir de la aplicación Express
const server = http.createServer(app);
// Configuración de CORS para Express
app.use(cors({
  origin: 'http://localhost:3000', // Permite solicitudes solo desde tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Permite el envío de credenciales (cookies, headers de autenticación)
}));
app.use(express.json());


const io = socketIo(server,{
  cors:{
    origin: "http://localhost:3000",
    methods:['GET', 'POST'],
    credentials: true
  },
  path:'/socket.io'
});

// Manejo de sockets para colaboración en tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Únete a una sala específica basada en el ID del diagrama
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Usuario ${socket.id} se unió a la sala: ${roomId}`);
  });

  // Manejo de actualizaciones del diagrama
  socket.on('update-diagram', (data) => {
    const { roomId, diagram } = data;
    // Emitir el diagrama actualizado a todos los usuarios en la sala, excepto al que lo envió
    socket.to(roomId).emit('diagram-updated', diagram);
  });

  // Desconexión del usuario
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
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
  .then(() => console.log('Conectado a la base de datos'))
  .catch((err) => console.error('Error de conexión:', err));

// Ruta base
app.get('/', (req, res) => {
  res.send('API en funcionamiento');
});
// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de diagramas protegidas
app.use('/api/diagramas', verificarToken, diagramaRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
