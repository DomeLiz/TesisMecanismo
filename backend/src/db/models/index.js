//llamara a todos los modelos 

const { User, UserSchema } = require('./users.model'); 
const { Usuario, UsuarioSchema } = require('./usuario.model');
const { OTP, OTPSchema } = require('./OTP');

function setupModels(sequelize) {
    User.init(UserSchema, User.config(sequelize)); // Configura el modelo de User
    Usuario.init(UsuarioSchema, Usuario.config(sequelize));
    OTP.init(OTPSchema, OTP.config(sequelize)); 
}

module.exports = setupModels;
