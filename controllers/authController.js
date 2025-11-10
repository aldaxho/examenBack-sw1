// Controlador de autenticación de usuarios
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const dotenv = require('dotenv');

dotenv.config();

// Registrar un nuevo usuario en el sistema
exports.register = async (req, res) => {
  const { nombre, correo, contraseña } = req.body;
  
  try {
    // Verificar si ya existe un usuario con ese correo
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear el nuevo usuario en la base de datos
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contraseña: hashedPassword,
    });

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar el usuario.', error });
  }
};

// Iniciar sesión (Login)
exports.login = async (req, res) => {
  const { correo, contraseña } = req.body;
  
  try {
    // Buscar el usuario por correo
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos.' });
    }

    // Verificar que la contraseña sea correcta
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos.' });
    }

    // Crear token JWT que expira en 3 horas
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '3h' });

    res.status(200).json({ mensaje: 'Login exitoso', token });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión.', error });
  }
};
