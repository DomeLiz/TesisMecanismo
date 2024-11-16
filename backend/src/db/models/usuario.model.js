const { Model, DataTypes } = require('sequelize');

// Nombre de la tabla
const USUARIOS_TABLE = 'usuarios';

class Usuario extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: USUARIOS_TABLE,
      modelName: 'Usuario',
      timestamps: true,
    };
  }
}

// Definición del esquema
const UsuarioSchema = {
  usuario_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(300),
    unique: true,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  cedula: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  direccion: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  fecha_nacimiento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  username: {
    type: DataTypes.STRING(300),
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  nivel_confidencialidad: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  idcustodio: { // Nuevo campo para almacenar la cédula del custodio
    allowNull: true,
    type: DataTypes.INTEGER, // Almacena la cédula del custodio
    }
};

module.exports = { Usuario, UsuarioSchema };
