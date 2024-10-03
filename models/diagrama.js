// models/diagrama.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Diagrama extends Model {
    static associate(models) {
      // Definir asociaciones aquí
      Diagrama.belongsToMany(models.Usuario, {
        through: models.DiagramaUsuario,
        foreignKey: 'diagramaId',
        otherKey: 'usuarioId',
      });
         // Relación belongsTo para indicar que un diagrama tiene un propietario (un solo Usuario)
         Diagrama.belongsTo(models.Usuario, {
          as: 'propietario',  // Alias para diferenciar el propietario
          foreignKey: 'usuarioId',  // La columna que guarda el ID del propietario
        });
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
      defaultValue: {}, // Valor predeterminado como objeto vacío
    },
    usuarioId: {
      type: DataTypes.UUID,
      allowNull: false, // Asegúrate de que este campo esté siempre presente
      references: {
        model: 'Usuario', // Nombre del modelo referenciado
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Diagrama',
    timestamps: true, // Para asegurar que createdAt y updatedAt se generen automáticamente
  });

  return Diagrama;
};
