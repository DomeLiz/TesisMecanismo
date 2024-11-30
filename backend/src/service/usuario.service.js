const { Usuario } = require('../db/models/usuario.model');  // Asegúrate de que estás importando 'Usuario' correctamente
const sequelize = require('../lib/sequelize');
const { models } = sequelize;
const bcrypt = require('bcrypt');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { sendFiles } = require('../mailer');

class UsuarioService {

  async crearUsuario(data) {
    const {
      nombre,
      apellido,
      email,
      telefono,
      cedula,
      direccion,
      fecha_nacimiento,
      username,
      password,
      rol,
      nivel_confidencialidad,
    } = data;
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const tempDir = path.resolve('C:\\temp\\certificates', username);
  
    try {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
  
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
  
      const privateKeyPath = path.join(tempDir, 'private.key');
      const csrPath = path.join(tempDir, 'request.csr');
      const certPath = path.join(tempDir, 'certificate.der');
  
      // Comandos OpenSSL
      const commands = [
        // Generar clave privada
        `openssl genpkey -algorithm RSA -out "${privateKeyPath}" -pkeyopt rsa_keygen_bits:2048`,
        // Crear CSR (Certificate Signing Request)
        `openssl req -new -key "${privateKeyPath}" -out "${csrPath}" -subj "/C=EC/ST=Pichincha/L=Quito/O=EPN/CN=${username}"`,
        // Generar certificado a partir del CSR (autofirmado, válido por 1 año)
        `openssl x509 -req -days 365 -in "${csrPath}" -signkey "${privateKeyPath}" -outform DER -out "${certPath}"`,
      ];
  
      for (const command of commands) {
        console.log(`Ejecutando comando: ${command}`);
        await new Promise((resolve, reject) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error ejecutando OpenSSL: ${stderr}`);
              return reject(error);
            }
            console.log(`Comando ejecutado exitosamente: ${stdout}`);
            resolve();
          });
        });
      }
  
      console.log('Verificando archivos generados...');
      if (!fs.existsSync(certPath)) throw new Error(`Certificado no encontrado: ${certPath}`);
      if (!fs.existsSync(privateKeyPath)) throw new Error(`Clave privada no encontrada: ${privateKeyPath}`);
  
      const certificado = fs.readFileSync(certPath);
      const claveprivada = fs.readFileSync(privateKeyPath);
  
      await newUser.update({
        certificado,
        claveprivada,
      });
  
      await sendFiles(
        email,
        'Tus Certificados Digitales',
        `Hola ${nombre} ${apellido},\n\nAdjunto encontrarás tus certificados digitales generados. Por favor, guárdalos en un lugar seguro.`,
        [
          { filename: 'certificado.der', content: certificado },
          { filename: 'claveprivada.key', content: claveprivada },
        ]
      );
  
      console.log('Limpiando archivos temporales...');
      fs.rmSync(tempDir, { recursive: true, force: true });
  
      return newUser;
    } catch (error) {
      console.error('Error al crear el usuario:', error);
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

  // Métodos auxiliares de búsqueda por cédula e ID (ya explicados en el mensaje anterior)
  async findByCedula(cedula) {
    try {
      const usuario = await Usuario.findOne({ where: { cedula } });
      if (!usuario) throw new Error('Usuario no encontrado');
      return usuario;
    } catch (error) {
      throw new Error('Error al buscar usuario por cédula');
    }
  }

  async findOne(id) {
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) throw new Error('Usuario no encontrado');
      return usuario;
    } catch (error) {
      throw new Error('Error al buscar usuario por ID');
    }
  }


  async assignCustodian(cedula, custodioId) {
    try {
      if (cedula === custodioId.toString()) {
        throw new Error('El usuario no puede asignarse como su propio custodio');
      }
  
      // Buscar la persona por su cedula (cedula es un campo varchar)
      const persona = await models.Usuario.findOne({ where: { cedula } });
      if (!persona) throw new Error('La persona asignada no existe en la base de datos');
  
      // Verificar si el custodio existe (custodioId es un entero)
      const custodio = await models.Usuario.findByPk(custodioId);
      if (!custodio) throw new Error('El custodio asignado no existe en la base de datos');
  
      // Actualizar el campo idcustodio de la persona
      persona.idcustodio = custodioId;
      await persona.save();
  
      // Cambiar el rol del custodio a "custodio"
      custodio.rol = 'custodio';
      await custodio.save();
  
      return {
        message: 'Custodio asignado correctamente',
        persona: persona.toJSON(),
        custodio: custodio.toJSON(),
      };
    } catch (error) {
      console.error('Error en assignCustodian:', error);
      throw new Error(error.message || 'Error al asignar custodio');
    }
  }  
  
  // Obtener el custodio de un usuario por cédula
  async getCustodian(cedula) {
    try {
      // Buscar la persona por su cédula usando el método findByCedula
      const persona = await this.findByCedula(cedula);
      if (!persona) {
        throw new Error('La persona no existe en la base de datos');
      }
  
      // Verificar si la persona tiene un custodio asignado
      if (!persona.idcustodio) {
        throw new Error('Este usuario no tiene un custodio asignado');
      }
  
      // Buscar al custodio usando el idcustodio
      const custodio = await models.Usuario.findByPk(persona.idcustodio);
      if (!custodio) {
        throw new Error('El custodio asignado no existe en la base de datos');
      }
  
      return {
        message: 'Custodio encontrado correctamente',
        custodio: custodio.toJSON(),
      };
    } catch (error) {
      console.error('Error en getCustodian:', error);
      throw new Error(error.message || 'Error al obtener el custodio');
    }
  }

  async eliminarCustodio(cedula) {
    try {
      // Buscar la persona por su cédula usando el método findByCedula
      const persona = await models.Usuario.findOne({ where: { cedula } });
      if (!persona) {
        throw new Error('La persona no existe en la base de datos');
      }
  
      // Verificar si la persona tiene un custodio asignado
      if (!persona.idcustodio) {
        throw new Error('Este usuario no tiene un custodio asignado');
      }
  
      // Buscar al custodio usando el idcustodio
      const custodio = await models.Usuario.findByPk(persona.idcustodio);
      if (!custodio) {
        throw new Error('El custodio asignado no existe en la base de datos');
      }
  
      // Eliminar la referencia al custodio en el usuario
      persona.idcustodio = null;
      await persona.save();
  
      // Cambiar el rol del custodio o eliminarlo, dependiendo de lo que quieras hacer
      custodio.rol = null;  // Cambiar el rol a usuario (puedes modificarlo según tu necesidad)
      await custodio.save();
  
      return {
        message: 'Custodio eliminado correctamente',
        personaActualizada: persona.toJSON(),
        custodioActualizado: custodio.toJSON(),
      };
    } catch (error) {
      console.error('Error en eliminarCustodio:', error);
      throw new Error(error.message || 'Error al eliminar el custodio');
    }
  }
  
// Obtener todos los custodiados de una persona por cédula
async getCustodiados(cedula) {
  try {
    // Buscar al usuario por su cédula
    const persona = await models.Usuario.findOne({ where: { cedula } });
    if (!persona) {
      throw new Error('La persona no existe en la base de datos');
    }

    // Obtener todos los usuarios que tienen como idcustodio el id de la persona
    const custodiados = await models.Usuario.findAll({
      where: { idcustodio: persona.usuario_id }
    });

    if (custodiados.length === 0) {
      throw new Error('No se encontraron custodiados para esta persona');
    }

    return {
      message: 'Custodiados encontrados correctamente',
      custodiados: custodiados.map(c => c.toJSON()),
    };
  } catch (error) {
    console.error('Error en getCustodiados:', error);
    throw new Error(error.message || 'Error al obtener los custodiados');
  }
}
  
}


module.exports = UsuarioService;
