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
          console.error('Error al buscar persona por cédula:', error.message);
          throw new Error('Error al buscar persona.');
      }
  }
  

      async create(data) {
        const { name, address, phone, email, cedula, password, custodianCedula = null } = data; // Desestructurar y permitir null
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
                cedula,
                custodianCedula // Agregar el custodio al crear la persona
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
    
    

    async update(cedula, data) {
        try {
            console.log('Actualizando persona con cédula:', cedula, 'Datos:', data);
            const model = await this.findByCedula(cedula); // Busca por cédula
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


  async assignCustodian(personId, custodianId) {
    try {
        // Lógica para asignar el custodio a la persona
        const person = await this.findByCedula(personId); // Busca la persona
        person.custodianCedula = custodianId; // Asigna la cédula del custodio
        await person.save(); // Guarda los cambios

        console.log(`Asignando custodio con ID ${custodianId} a la persona con ID ${personId}`);
        return { personId, custodianId }; // Retornar un objeto con la relación
    } catch (error) {
        console.error('Error al asignar custodio:', error.message);
        throw new Error('Error al asignar custodio.');
    }
}
async findCustodianByCedula(cedula) {
  try {
      // Buscar a la persona por cédula
      const person = await models.Person.findOne({ where: { cedula } });

      if (!person) {
          throw new Error('No se encontró a la persona con la cédula proporcionada: ' + cedula);
      }

      // Verifica si la persona tiene un custodio asignado
      if (!person.custodianCedula) {
          throw new Error('No se encontró un custodio para esta persona: ' + cedula);
      }

      // Busca el custodio usando la cédula del custodio
      const custodian = await models.Person.findOne({ where: { cedula: person.custodianCedula } });
      if (!custodian) {
          throw new Error('Custodio no encontrado para la cédula: ' + person.custodianCedula);
      }

      return custodian; // Devuelve la información del custodio
  } catch (error) {
      console.error('Error al buscar custodio:', error.message);
      throw new Error('Error al buscar custodio: ' + error.message);
  }
}

async removeCustodian(cedula) {
    try {
        console.log('Eliminando custodio para la persona con cédula:', cedula);
        // Buscar a la persona por cédula
        const person = await this.findByCedula(cedula);

        if (!person) {
            throw new Error('Persona no encontrada con esa cédula.');
        }

        // Establecer el campo custodianCedula a null para eliminar la asignación
        person.custodianCedula = null;
        await person.save();

        console.log(`Custodio eliminado para la persona con cédula ${cedula}`);
        return person;
    } catch (error) {
        console.error('Error al eliminar custodio:', error.message);
        throw new Error('Error al eliminar custodio.');
    }
}

async findCustodiadosByCustodianCedula(custodianCedula) {
    try {
        // Busca las personas que tengan asignado al custodio
        const custodians = await models.Person.findAll({ where: { custodianCedula } });

        if (!custodians || custodians.length === 0) {
            throw new Error('No se encontraron personas que tengan asignado este custodio.');
        }

        return custodians; // Devuelve la lista de custodios
    } catch (error) {
        console.error('Error al buscar custodiados por cédula de custodio:', error.message);
        throw new Error('Error al buscar custodiados.');
    }
}


}

module.exports = PersonService;
