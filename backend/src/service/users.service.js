const { models } = require('../lib/sequelize');
const bcrypt = require('bcryptjs');

class UserService {
  constructor() {}

  async create(data) {
    const hash = await bcrypt.hash(data.password, 10); // Hash de la contraseña
    const newUser = await models.Usuario.create({ ...data, password: hash });
    return newUser;
  }

  async findByCedula(cedula) { // Buscar por cédula
    const user = await models.Usuario.findOne({ where: { cedula } });
    return user;
  }

  async findByEmail(email) { // Buscar por email
    const user = await models.Usuario.findOne({ where: { email } });
    return user;
  }

  async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserService;
