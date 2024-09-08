const { Sequelize } = require('sequelize');

const {config } = require('../config/config');
const setupModels = require('./../db/models');

const sequelize = new Sequelize(
    config.dbName,
    config.dbUser,
    config.dbPassword,
    {
        host: config.dbHost,
        dialect: 'postgres' //ojo 
    }
);
sequelize.sync()
    .then(() => console.log('Sincronización completa'))
    .catch(error => console.error('Error en la sincronización:', error));


setupModels(sequelize);

module.exports = sequelize;