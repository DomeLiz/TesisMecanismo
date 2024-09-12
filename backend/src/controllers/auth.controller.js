const UserService = require('../service/users.service');
const userservice = new UserService();
const jwt = require('jsonwebtoken');
const PersonsService = require('../service/persona.service');
const personService = new PersonsService();
const otpGenerator = require('otp-generator');
const { sendOTP } = require('../mailer');

const otpStore = {}; // Guarda el OTP para el usuario temporalmente

// Registro de usuario

const register = async (req, res) => {
  try {
    const { person, user } = await personService.create(req.body);
    res.status(201).json({ success: true, data: { person, user } });
  } catch (error) {
    // Enviar el mensaje exacto del error que ocurrió
    res.status(500).json({ success: false, message: error.message });
  }
};



// Login de usuario y envío de OTP
const login = async (req, res) => {
  try {
    const { cedula, password } = req.body;
    const user = await userservice.findByCedula(cedula);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    }

    const validPassword = await userservice.validatePassword(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Contraseña incorrecta' });
    }

    // Obtener el correo de la tabla persons
    const person = await personService.findByCedula(cedula);
    const email = person ? person.email : null;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Correo electrónico no encontrado' });
    }

    // Generar OTP
    const otp = otpGenerator.generate(6, { digits: true });
    otpStore[cedula] = otp; // Almacena OTP en memoria temporalmente

    // Enviar OTP por correo
    await sendOTP(email, otp);

    res.json({ success: true, message: 'OTP enviado al correo' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verificar OTP
const verifyOTP = (req, res) => {
  const { cedula, otp } = req.body;

  if (otpStore[cedula] === otp) {
    delete otpStore[cedula]; // Eliminar OTP una vez verificado

    // Generar JWT y devolverlo
    const token = jwt.sign({ cedula }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } else {
    res.status(400).json({ success: false, message: 'OTP incorrecto o expirado' });
  }
};

module.exports = { register, login, verifyOTP };
