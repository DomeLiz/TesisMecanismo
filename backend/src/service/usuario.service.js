const { Usuario } = require('../db/models/usuario.model');  // Asegúrate de que estás importando 'Usuario' correctamente
const sequelize = require('../lib/sequelize');
const { models } = sequelize;
const bcrypt = require('bcrypt');
const { ValidationError, UniqueConstraintError } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { sendFiles, sendCustodianInvitation } = require('../mailer');
const { sendOTP } = require('../mailer');
const { OTP } = require('../db/models/OTP');


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
      // Crear directorio temporal para certificados
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

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

      const commands = [
        `openssl genpkey -algorithm RSA -out "${privateKeyPath}" -pkeyopt rsa_keygen_bits:2048`,
        `openssl req -new -key "${privateKeyPath}" -out "${csrPath}" -subj "/C=EC/ST=Pichincha/L=Quito/O=EPN/CN=${username}"`,
        `openssl x509 -req -days 365 -in "${csrPath}" -signkey "${privateKeyPath}" -outform DER -out "${certPath}"`,
      ];

      for (const command of commands) {
        await new Promise((resolve, reject) => {
          exec(command, (error, stdout, stderr) => {
            if (error) return reject(error);
            resolve();
          });
        });
      }

      if (!fs.existsSync(certPath) || !fs.existsSync(privateKeyPath)) {
        throw new Error('Error generando certificados');
      }

      const certificado = fs.readFileSync(certPath);
      const claveprivada = fs.readFileSync(privateKeyPath);

      await newUser.update({ certificado, claveprivada });

      await sendFiles(
        email,
        'Tus Certificados Digitales',
        `Hola ${nombre} ${apellido},\nAdjunto encontrarás tus certificados digitales.`,
        [
          { filename: 'certificado.der', content: certificado },
          { filename: 'claveprivada.key', content: claveprivada },
        ]
      );

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

  async verifyOtp(cedula, otp) {
    try {
      // Buscar el OTP asociado al usuario por su cédula
      const otpRecord = await models.OTP.findOne({
        where: { custodioId: cedula, otp, expiration: { [Sequelize.Op.gt]: new Date() } }, // Verifica que no haya expirado
      });

      if (!otpRecord) {
        return { success: false, message: 'OTP inválido o expirado' }; // OTP no válido o expirado
      }

      // Si llegamos hasta aquí, significa que el OTP es válido
      return { success: true, message: 'OTP verificado correctamente' };
    } catch (error) {
      console.error('Error al verificar OTP:', error);
      return { success: false, message: 'Error al verificar OTP' };
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

// El método assignCustodian permanece igual
async assignCustodian(cedula, custodioId) {
  try {
    // Validar que los parámetros sean correctos
    if (!cedula || !custodioId) {
      throw new Error('Cédula y custodioId son requeridos');
    }

    // Buscar al usuario por su cédula
    const persona = await models.Usuario.findOne({ where: { cedula } });
    if (!persona) {
      throw new Error('No se encontró un usuario con la cédula proporcionada');
    }

    // Buscar al custodio por su ID
    const custodio = await models.Usuario.findOne({ where: { usuario_id: custodioId } });
    if (!custodio) {
      throw new Error('No se encontró un custodio con el ID proporcionado');
    }

    // Verificar si el usuario intenta asignarse a sí mismo como custodio
    if (persona.usuario_id === custodio.usuario_id) {
      throw new Error('El usuario no puede asignarse a sí mismo como custodio');
    }

    // Asignar el custodio al usuario
    persona.idcustodio = custodioId;
    await persona.save();

    // Devolver un mensaje de éxito
    return {
      message: 'Custodio asignado correctamente',
      persona: {
        usuario_id: persona.usuario_id,
        nombre: persona.nombre,
        apellido: persona.apellido,
        cedula: persona.cedula,
        idcustodio: persona.idcustodio,
      },
    };
  } catch (error) {
    // Manejo de errores y devolución de mensaje
    return { error: error.message || 'Error al asignar custodio' };
  }
}
 
}


module.exports = UsuarioService;
