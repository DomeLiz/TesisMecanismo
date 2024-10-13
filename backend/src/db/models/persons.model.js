const { Model, DataTypes } = require('sequelize');

const PERSONS_TABLE ='persons';

class Person extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: PERSONS_TABLE,
            modulName: 'Person',
            timestamps: true 
        }
    }
}

const PersonSchema = {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    name: {
        allowNull: false,
        type: DataTypes.STRING,
        field:'name'
    },
    address: {
        allowNull: false,
        type: DataTypes.STRING,
        field:'address'
    },
    phone: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field:'phone'
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true, // Añadir el campo email a persons
    },
    cedula: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true, 
    },
    custodianCedula: { // Nuevo campo para almacenar la cédula del custodio
        allowNull: true,
        type: DataTypes.STRING, // Almacena la cédula del custodio
    }

}

module.exports = { Person, PersonSchema};

