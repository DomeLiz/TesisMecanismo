const UserService = require('../service/users.service');
const userservice = new UserService();
const jwt = require('jsonwebtoken');
const UsuarioService= require('../service/usuario.service');
const usuarioService = new UsuarioService();
const otpGenerator = require('otp-generator');
const { sendOTP, sendLoginFailEmail,sendOtpFailEmail } = require('../mailer');

const otpStore = {}; // Guarda el OTP para el usuario temporalmente

// Login de usuario y envío de OTP
const login = async (req, res) => {
  try {
    const { cedula, password } = req.body;
    const user = await userservice.findByCedula(cedula);

    if (!user) {
      // Intento de login fallido: usuario no encontrado
      await sendLoginFailEmail(cedula, 'Usuario no encontrado');
      return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    }

    const validPassword = await userservice.validatePassword(password, user.password);
    if (!validPassword) {
      // Intento de login fallido: contraseña incorrecta
    const usuarioService = new UsuarioService();
      const person = await usuarioService.findByCedula( cedula);
      if (person && person.email) {
        await sendLoginFailEmail(person.email, 'Contraseña incorrecta');
      }
      return res.status(400).json({ success: false, message: 'Contraseña incorrecta' });
    }

    // Continuación del proceso si login es correcto...
    const person = await usuarioService.findByCedula(cedula);
    const email = person ? person.email : null;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Correo electrónico no encontrado' });
    }

    const otp = otpGenerator.generate(6, { digits: true });
    otpStore[cedula] = otp;

    await sendOTP(email, otp);

    res.json({ success: true, message: 'OTP enviado al correo' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  const { cedula, otp } = req.body;

  // Verifica si el OTP es correcto
  if (otpStore[cedula] === otp) {
    delete otpStore[cedula]; // Eliminar OTP una vez verificado

    // Generar JWT y devolverlo
    const token = jwt.sign({ cedula }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } else {
    // Envía un correo si el OTP es incorrecto
    const person = await userservice.findByCedula(cedula);
    if (person && person.email) {
      await sendOtpFailEmail(person.email, cedula);
    }
    res.status(400).json({ success: false, message: 'OTP incorrecto o expirado' });
  }
};

module.exports = { login, verifyOTP };
