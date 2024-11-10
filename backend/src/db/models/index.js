//llamara a todos los modelos 
const { Person, PersonSchema } = require ('./persons.model');

const { User, UserSchema } = require('./users.model'); 
const { Usuario, UsuarioSchema } = require('./usuario.model');


function setupModels(sequelize) {
    Person.init(PersonSchema,Person.config(sequelize));
    User.init(UserSchema, User.config(sequelize)); // Configura el modelo de User
    Usuario.init(UsuarioSchema, Usuario.config(sequelize));
}

module.exports = setupModels;
