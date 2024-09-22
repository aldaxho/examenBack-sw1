// models/diagrama.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Diagrama extends Model {
    static associate(models) {
      // Definir asociaciones aquí si es necesario
    }
  }

  Diagrama.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Genera automáticamente un UUID
      primaryKey: true,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false, // No permitir valores nulos
    },
    contenido: {
      type: DataTypes.JSONB, // Asegúrate de que el contenido sea un objeto JSON válido
      allowNull: false,
      defaultValue: {} // Valor predeterminado como objeto vacío
    },
    usuarioId: {
      type: DataTypes.UUID,
      allowNull: false, // Asegúrate de que este campo esté siempre presente
    }
  }, {
    sequelize,
    modelName: 'Diagrama',
    timestamps: true, // Para asegurar que createdAt y updatedAt se generen automáticamente
  });

  return Diagrama;
};
