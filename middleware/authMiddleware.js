// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { Usuario } = require('../models');

dotenv.config();

exports.verificarToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];;
  if (!token) {
    return res.status(403).json({ mensaje: 'Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    req.user = usuario;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido.' });
  }
};
