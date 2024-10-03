'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DiagramaUsuarios', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      diagramaId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Diagramas', // Nombre de la tabla de diagramas
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      usuarioId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Usuarios', // Nombre de la tabla de usuarios
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permiso: {
        type: Sequelize.ENUM('editor', 'lector'),
        allowNull: false,
        defaultValue: 'lector',
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aceptado', 'rechazado'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      codigoInvitacion: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      isValid: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Crear un índice único para evitar duplicados de diagramaId y usuarioId
    await queryInterface.addConstraint('DiagramaUsuarios', {
      fields: ['diagramaId', 'usuarioId'],
      type: 'unique',
      name: 'unique_diagrama_usuario',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar el índice único
    await queryInterface.removeConstraint('DiagramaUsuarios', 'unique_diagrama_usuario');

    // Eliminar la tabla
    await queryInterface.dropTable('DiagramaUsuarios');

    // Eliminar los tipos ENUM creados
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_DiagramaUsuarios_permiso";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_DiagramaUsuarios_estado";');
  },
};
