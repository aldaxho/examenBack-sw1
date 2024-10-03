// models/diagramaUsuario.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DiagramaUsuario extends Model {
    static associate(models) {
      // Definir asociaciones si es necesario
      DiagramaUsuario.belongsTo(models.Diagrama, { foreignKey: 'diagramaId' });
      DiagramaUsuario.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
    }
  }

  DiagramaUsuario.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    diagramaId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Diagrama',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    usuarioId: {
      type: DataTypes.UUID,
      allowNull: true, // Permitir null para invitaciones pendientes
      references: {
        model: 'Usuario',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    permiso: {
      type: DataTypes.ENUM('editor', 'lector'),
      allowNull: false,
      defaultValue: 'lector',
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aceptado', 'rechazado'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    codigoInvitacion: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    isValid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'DiagramaUsuario',
  });

  return DiagramaUsuario;
};
