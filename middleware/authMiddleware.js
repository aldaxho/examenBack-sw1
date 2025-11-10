// Middleware para verificar tokens de autenticación JWT
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { Usuario } = require('../models');

dotenv.config();

// Verificar que el usuario tenga un token válido antes de acceder a rutas protegidas
exports.verificarToken = async (req, res, next) => {
  // Extraer el token del header Authorization
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    console.log('Token no proporcionado');
    return res.status(403).json({ mensaje: 'Token no proporcionado.' });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    
    console.log('Usuario autenticado:', usuario.nombre);
    
    // Guardar el usuario en la petición para usarlo en los controladores
    req.user = usuario;
    next();
  } catch (error) {
    console.log('Token inválido o error:', error);
    res.status(401).json({ mensaje: 'Token inválido.' });
  }
};
