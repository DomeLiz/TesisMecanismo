const { Sequelize } = require('sequelize');
const { config } = require('../config/config'); // Asegúrate que config esté correcto
const setupModels = require('./../db/models'); // Esto se usa para registrar los modelos

// Crear la instancia de Sequelize con la configuración correcta
const sequelize = new Sequelize(
    config.dbName,
    config.dbUser,
    config.dbPassword,
    {
        host: config.dbHost,
        dialect: 'postgres', // Asegúrate de que el dialecto sea correcto (por ejemplo, 'postgres')
    }
);

// Sincronizar la base de datos
sequelize.sync()
    .then(() => console.log('Sincronización completa'))
    .catch(error => console.error('Error en la sincronización:', error));

// Registrar los modelos después de crear la instancia de Sequelize
setupModels(sequelize);

module.exports = sequelize;
