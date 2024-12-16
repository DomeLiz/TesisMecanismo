const UserService = require('../service/users.service');
const userservice = new UserService();
const jwt = require('jsonwebtoken');
const UsuarioService = require('../service/usuario.service');
const usuarioService = new UsuarioService();
const otpGenerator = require('otp-generator');
const { sendOTP, sendLoginFailEmail, sendOtpFailEmail } = require('../mailer');
const crypto = require('crypto');

const otpStore = {}; 

const MAX_FAILED_ATTEMPTS = 3; // Número máximo de intentos fallidos permitidos
const BLOCK_TIME = 2 * 60 * 1000; // Tiempo de bloqueo en milisegundos (2 minutos)

// Método de login optimizado
const login = async (req, res) => {
  try {
    const { cedula } = req.body;
    const certificado = req.files?.certificado;

    if (!certificado) {
      return res.status(400).json({ success: false, message: 'Certificado no proporcionado' });
    }

    // Validar extensión del archivo
    if (!certificado.name.endsWith('.der')) {
      return res.status(400).json({
        success: false,
        message: 'Formato de archivo no permitido. Solo se aceptan certificados .der',
      });
    }

    const user = await usuarioService.findByCedula(cedula);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Verificar estado del usuario (bloqueo temporal)
    const now = Date.now();
    const lastFailedAttempt = new Date(user.ultimo_intento_fallido).getTime();
    const timeSinceLastFailedAttempt = now - lastFailedAttempt;

    if (!user.estado && timeSinceLastFailedAttempt < BLOCK_TIME) {
      const timeRemaining = Math.ceil((BLOCK_TIME - timeSinceLastFailedAttempt) / 60000);
      return res.status(400).json({
        success: false,
        message: `Tu cuenta está bloqueada. Inténtalo de nuevo en ${timeRemaining} minuto(s).`,
      });
    }

    // Comparar certificado en memoria usando hash MD5
    const tempCertHash = crypto.createHash('md5').update(certificado.data).digest('hex');
    const storedCertHash = crypto.createHash('md5').update(user.certificado).digest('hex');

    if (tempCertHash !== storedCertHash) {
      // Incrementar intentos fallidos
      const failedAttempts = user.intentos_fallidos + 1;
      await user.update({
        intentos_fallidos: failedAttempts,
        ultimo_intento_fallido: new Date(),
        estado: failedAttempts >= MAX_FAILED_ATTEMPTS ? false : user.estado,
      });

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        return res.status(400).json({
          success: false,
          message: 'Demasiados intentos fallidos. Tu cuenta está bloqueada por 2 minutos.',
        });
      }

      return res.status(400).json({ success: false, message: 'Certificado inválido o no coincide.' });
    }

    // Restablecer intentos fallidos
    await user.update({ intentos_fallidos: 0, ultimo_intento_fallido: null });

    // Generar OTP
    const otp = otpGenerator.generate(6, { digits: true });
    otpStore[cedula] = otp;

    // Enviar OTP al correo
    await sendOTP(user.email, otp);

    return res.json({
      success: true,
      message: 'OTP enviado al correo',
      role: user.rol,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

// Método para verificar OTP
const verifyOTP = async (req, res) => {
  try {
    const { cedula, otp } = req.body;

    if (otpStore[cedula] === otp) {
      // Eliminar OTP tras verificación exitosa
      delete otpStore[cedula];

      // Generar JWT y responder
      const token = jwt.sign({ cedula }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, token });
    } else {
      // Enviar correo si el OTP es incorrecto
      const person = await userservice.findByCedula(cedula);
      if (person && person.email) {
        await sendOtpFailEmail(person.email, cedula);
      }
      res.status(400).json({ success: false, message: 'OTP incorrecto o expirado' });
    }
  } catch (error) {
    console.error('Error verificando OTP:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login, verifyOTP };
