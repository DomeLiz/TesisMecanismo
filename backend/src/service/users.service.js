const { models } = require('../lib/sequelize');
const bcrypt = require('bcryptjs');

class UserService {
  constructor() {}

  async create(data) {
    const hash = await bcrypt.hash(data.password, 10); // Hash de la contraseña
    const newUser = await models.User.create({ ...data, password: hash });
    return newUser;
  }

  async findByCedula(cedula) { // Buscar por cédula
    const user = await models.User.findOne({ where: { cedula } });
    return user;
  }

  async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserService;
