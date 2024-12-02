const UsuarioService = require('../service/usuario.service');
const service = new UsuarioService(); 

  const crearUsuario = async (req, res)  =>{
    try {
      const usuarioData = req.body;
      const newUsuario = await service.crearUsuario(usuarioData);
      res.status(201).json(newUsuario);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  const find = async (req, res)=> {
    try {
      const usuarios = await service.find();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Buscar un usuario por ID
  const findOne = async(req, res) =>{
    try {
      const { id } = req.params; // Obtener el ID de los parámetros de la ruta
      const usuario = await service.findOne(id);
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Buscar un usuario por cédula
 const findByCedula=  async(req, res)=> {
    try {
      const { cedula } = req.params; // Obtener la cédula de los parámetros de la ruta
      const usuario = await service.findByCedula(cedula);
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Actualizar un usuario por cédula
  const update =async(req, res)=> {
    try {
      const { cedula } = req.params; // Obtener la cédula de los parámetros de la ruta
      const usuarioData = req.body; // Obtener los datos a actualizar desde el cuerpo de la solicitud
      const updatedUsuario = await service.update(cedula, usuarioData);
      res.status(200).json(updatedUsuario);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Eliminar un usuario por ID
  const _delete = async(req, res)=> {
    try {
      const { id } = req.params; // Obtener el ID de los parámetros de la ruta
      await service.delete(id);
      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }


  const assignCustodian = async (req, res) => {
    try {
      const { cedula, custodioId } = req.body;
  
      // Llama al servicio para asignar el custodio
      const result = await service.assignCustodian(cedula, custodioId);
  
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

  // Obtener el custodio de un usuario por cédula
  const getCustodian = async (req, res) => {
    try {
      const { cedula } = req.params; // Obtener la cédula de los parámetros de la URL
  
      if (!cedula) {
        throw new Error('La cédula es requerida');
      }
  
      // Llamar al servicio para obtener el custodio usando la cédula
      const result = await service.getCustodian(cedula);
  
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };


  const eliminarCustodio = async (req, res) => {
    try {
      const { cedula } = req.params; // Obtenemos la cédula de los parámetros de la URL
  
      if (!cedula) {
        throw new Error('La cédula es requerida');
      }
  
      // Llamamos al servicio para eliminar el custodio
      const result = await service.eliminarCustodio(cedula);
  
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Enviar OTP al correo
const sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // Generar un código OTP de 6 dígitos

  try {
      // Guardar el OTP temporalmente
      otpStore[email] = otp;

      // Enviar el OTP al correo
      await sendOTP(email, otp);
      res.json({ success: true, message: 'OTP enviado correctamente' });
  } catch (error) {
      console.error('Error al enviar OTP:', error);
      res.status(500).json({ success: false, message: 'Error al enviar OTP' });
  }
};

// Verificar OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
      if (otpStore[email] && otpStore[email] == otp) {
          // OTP correcto, eliminar del almacenamiento temporal
          delete otpStore[email];
          res.json({ success: true, message: 'OTP verificado correctamente' });
      } else {
          res.status(400).json({ success: false, message: 'OTP incorrecto' });
      }
  } catch (error) {
      console.error('Error al verificar OTP:', error);
      res.status(500).json({ success: false, message: 'Error al verificar OTP' });
  }
};

// Obtener los custodiados de un usuario por cédula
const getCustodiados = async (req, res) => {
  try {
    const { cedula } = req.params; // Obtener la cédula de los parámetros de la URL

    if (!cedula) {
      throw new Error('La cédula es requerida');
    }

    // Llamar al servicio para obtener los custodiados usando la cédula
    const result = await service.getCustodiados(cedula);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// En el controlador
const validateCustodian = async (req, res) => {
  try {
    const { cedula, custodioId } = req.body;

    if (!cedula || !custodioId) {
      throw new Error('La cédula y el ID del custodio son requeridos');
    }

    // Llamamos al servicio para validar la relación entre el usuario y el custodio
    const result = await service.validateCustodian(cedula, custodioId);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
   

module.exports = {
  crearUsuario,
  find,
  findOne,
  findByCedula,
  update,
  _delete,
  assignCustodian, 
  getCustodian,
  eliminarCustodio,
  sendOtp,
  verifyOtp,
  getCustodiados,
  validateCustodian
};
