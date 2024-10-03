// models/usuario.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // Definir asociaciones aquí
      Usuario.belongsToMany(models.Diagrama, {
        through: models.DiagramaUsuario,
        foreignKey: 'usuarioId',
        otherKey: 'diagramaId',
      });
    }
  }

  Usuario.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  
  return Usuario;
};
