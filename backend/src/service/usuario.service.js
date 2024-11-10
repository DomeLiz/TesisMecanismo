const { Usuario } = require('../db/models/usuario.model');  // Asegúrate de que estás importando 'Usuario' correctamente
const sequelize = require('../lib/sequelize');
const { models } = sequelize;
const bcrypt = require('bcrypt');
const { ValidationError, UniqueConstraintError } = require('sequelize');

class UsuarioService {
  async crearUsuario(data) {
    const { nombre, apellido, email, telefono, cedula, direccion, fecha_nacimiento, username, password, rol, nivel_confidencialidad } = data;

    // Validación de datos adicionales aquí, si es necesario
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Intentamos crear el nuevo usuario
      const newUser = await Usuario.create({
        nombre,
        apellido,
        email,
        telefono,
        cedula,
        direccion,
        fecha_nacimiento,
        fecha_creacion: new Date(),
        estado: true,
        username,
        password: hashedPassword,
        rol,
        nivel_confidencialidad,
      });

      return newUser;
    } catch (error) {
      // Manejo de errores específico
      if (error instanceof UniqueConstraintError) {
        // Si hay un error de restricción única (duplicados en email, username o cedula)
        throw new Error(`El valor para ${error.fields} ya está en uso. Por favor, utiliza otro.`);
      }

      if (error instanceof ValidationError) {
        // Si hay un error de validación (por ejemplo, campos faltantes o inválidos)
        const validationErrors = error.errors.map(err => err.message).join(', ');
        throw new Error(`Error de validación: ${validationErrors}`);
      }

      // Para cualquier otro error
      throw new Error('Error al crear el usuario: ' + error.message);
    }
  }

  async find() {
    try {
      console.log('Buscando todos los usuarios');
      const usuarios = await models.Usuario.findAll();
      return usuarios;
    } catch (error) {
      console.error('Error en find:', error);
      throw new Error('Error al buscar usuarios.');
    }
  }

  // Obtener un usuario por ID
  async findOne(id) {
    try {
      console.log('Buscando usuario con ID:', id);
      const usuario = await models.Usuario.findByPk(id);
      if (!usuario) throw new Error('Usuario no encontrado');
      return usuario;
    } catch (error) {
      console.error('Error en findOne:', error);
      throw new Error('Error al buscar usuario.');
    }
  }

  // Obtener un usuario por cédula
  async findByCedula(cedula) {
    try {
      console.log('Buscando usuario con cédula:', cedula);
      const usuario = await models.Usuario.findOne({ where: { cedula } });
      if (!usuario) throw new Error('Usuario no encontrado');
      return usuario;
    } catch (error) {
      console.error('Error en findByCedula:', error);
      throw new Error('Error al buscar usuario por cédula.');
    }
  }
  
  // Actualizar un usuario por cédula
  async update(cedula, data) {
    try {
      console.log('Actualizando usuario con cédula:', cedula, 'Datos:', data);
      const usuario = await this.findByCedula(cedula); // Buscar por cédula
      const updatedUsuario = await usuario.update(data); // Actualiza los datos
      return updatedUsuario;
    } catch (error) {
      console.error('Error en update:', error);
      throw new Error('Error al actualizar usuario.');
    }
  }

  // Eliminar un usuario por ID
  async delete(id) {
    try {
      console.log('Eliminando usuario con ID:', id);
      const usuario = await this.findOne(id); // Buscar por ID
      await usuario.destroy(); // Eliminar el usuario
      return { deleted: true }; // Retorna un objeto indicando que fue eliminado
    } catch (error) {
      console.error('Error en delete:', error);
      throw new Error('Error al eliminar usuario.');
    }
  }
  
}


module.exports = new UsuarioService();
