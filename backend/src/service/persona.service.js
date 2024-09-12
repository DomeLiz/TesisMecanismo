const sequelize = require('../lib/sequelize');  // Importar la instancia de Sequelize
const { models } = sequelize;
const { Person } = require('../db/models/persons.model')

const bcrypt = require('bcryptjs');

class PersonService {
    async find() {
        try {
            console.log('Buscando todas las personas');
            const res = await models.Person.findAll();
            return res;
        } catch (error) {
            console.error('Error en find:', error);
            throw new Error('Error al buscar personas.');
        }
    }

    async findOne(id) {
        try {
            console.log('Buscando persona con ID:', id);
            const res = await models.Person.findByPk(id);
            if (!res) throw new Error('Persona no encontrada');
            return res;
        } catch (error) {
            console.error('Error en findOne:', error);
            throw new Error('Error al buscar persona.');
        }
    }

    async findByCedula(cedula) {
        try {
          const person = await Person.findOne({ where: { cedula } });
          if (!person) {
            throw new Error('Persona no encontrada');
          }
          return person;
        } catch (error) {
          console.error('Error al buscar persona por cédula:', error);
          throw new Error('Error al buscar persona por cédula');
        }
      }

    async create1(data) {
        const { name, address, phone, email, cedula, password } = data;
        const transaction = await sequelize.transaction();
      
        try {
          // Verificar si ya existe una persona o usuario con la misma cédula
          const existingUser = await models.User.findOne({ where: { cedula } });
          if (existingUser) {
            throw new Error('El usuario ya existe con esa cédula');
          }
      
          // Insertar en la tabla persons
          const person = await models.Person.create({
            name,
            address,
            phone,
            email,
            cedula
          }, { transaction });
      
          // Encriptar la contraseña
          const hashedPassword = await bcrypt.hash(password, 10);
      
          // Insertar en la tabla users
          const user = await models.User.create({
            cedula,
            password: hashedPassword,  // Almacenar la contraseña encriptada
            personId: person.id  // Relacionar el registro con la persona creada
          }, { transaction });
      
          await transaction.commit();  // Confirmar la transacción
          return { person, user };      // Retornar ambos objetos
        } catch (error) {
          await transaction.rollback();  // Revertir la transacción en caso de error
          console.error('Error al crear usuario y persona:', error.message);
          throw new Error('Error al crear usuario y persona.');
        }
      }

      async create(data) {
        const { name, address, phone, email, cedula, password } = data;
        const transaction = await sequelize.transaction();
        
        try {
          // Verificar si ya existe una persona o usuario con la misma cédula
          const existingUser = await models.User.findOne({ where: { cedula } });
          if (existingUser) {
            throw new Error('El usuario ya existe con esa cédula');
          }
      
          // Insertar en la tabla persons
          const person = await models.Person.create({
            name,
            address,
            phone,
            email,
            cedula
          }, { transaction });
      
          // Encriptar la contraseña
          const hashedPassword = await bcrypt.hash(password, 10);
      
          // Insertar en la tabla users
          const user = await models.User.create({
            cedula,
            password: hashedPassword,  // Almacenar la contraseña encriptada
            personId: person.id  // Relacionar el registro con la persona creada
          }, { transaction });
      
          await transaction.commit();  // Confirmar la transacción
          return { person, user };      // Retornar ambos objetos
        } catch (error) {
          await transaction.rollback();  // Revertir la transacción en caso de error
          console.error('Error al crear usuario y persona:', error.message);
          // En lugar de sobrescribir el mensaje, propaga el mensaje completo del error
          throw new Error(`Error al crear usuario y persona: ${error.message}`);
        }
      }
      

    async update(id, data) {
        try {
            console.log('Actualizando persona con ID:', id, 'Datos:', data);
            const model = await this.findOne(id);
            const res = await model.update(data);
            return res;
        } catch (error) {
            console.error('Error en update:', error);
            throw new Error('Error al actualizar persona.');
        }
    }

    async delete(id) {
        try {
            console.log('Eliminando persona con ID:', id);
            const model = await this.findOne(id);
            await model.destroy();
            return { deleted: true };
        } catch (error) {
            console.error('Error en delete:', error);
            throw new Error('Error al eliminar persona.');
        }
    }
}

module.exports = PersonService;
