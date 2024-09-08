//llamara a todos los modelos 
const { Person, PersonSchema } = require ('./persons.model');

const { User, UserSchema } = require('./users.model'); // Importa el modelo de User


function setupModels(sequelize) {
    Person.init(PersonSchema,Person.config(sequelize));
    User.init(UserSchema, User.config(sequelize)); // Configura el modelo de User
}

module.exports = setupModels;
