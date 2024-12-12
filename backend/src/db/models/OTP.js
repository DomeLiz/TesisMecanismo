// En el archivo models/otp.model.js
const { Model, DataTypes } = require('sequelize');

const OTP_TABLE = 'otps'; // Nombre de la tabla

class OTP extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: OTP_TABLE,
      modelName: 'OTP',
      timestamps: false, // No necesitamos timestamps para este modelo
    };
  }
}

const OTPSchema = {
  otp_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  custodioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  otp: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  expiration: {
    type: DataTypes.DATE,
    allowNull: false,
  },
};

module.exports = { OTP, OTPSchema };
