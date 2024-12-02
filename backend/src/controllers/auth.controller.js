const UserService = require('../service/users.service');
const userservice = new UserService();
const jwt = require('jsonwebtoken');
const UsuarioService = require('../service/usuario.service');
const usuarioService = new UsuarioService();
const otpGenerator = require('otp-generator');
const { sendOTP, sendLoginFailEmail, sendOtpFailEmail } = require('../mailer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const otpStore = {}; 

const MAX_FAILED_ATTEMPTS = 3; // Número máximo de intentos fallidos permitidos
const BLOCK_TIME = 2 * 60 * 1000; // Tiempo de bloqueo en milisegundos (15 minutos)

// Método de login con intento fallido y control de bloqueo
const login2 = async (req, res) => {
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

    if (!user || !user.certificado) {
      // Incrementar intentos fallidos y actualizar el último intento fallido
      await user.update({
        intentos_fallidos: user.intentos_fallidos + 1,
        ultimo_intento_fallido: new Date(),
      });

      if (user.intentos_fallidos >= MAX_FAILED_ATTEMPTS) {
        const timeRemaining = BLOCK_TIME - (new Date() - user.ultimo_intento_fallido);
        const minutesRemaining = Math.ceil(timeRemaining / 60000);

        if (timeRemaining > 0) {
          return res.status(400).json({
            success: false,
            message: `Demasiados intentos fallidos. Por favor, intente nuevamente en ${minutesRemaining} minuto(s).`,
          });
        }
      }

      await sendLoginFailEmail(user?.email || 'admin@example.com', 'Usuario o certificado oficial no encontrado');
      return res.status(400).json({ success: false, message: 'Usuario o certificado oficial no encontrado' });
    }

    const tempDir = path.resolve('C:\\temp\\certificates');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempCertPath = path.join(tempDir, `${cedula}.der`);
    const officialCertPath = path.join(tempDir, `${cedula}_official.der`);

    try {
      // Guardar archivos temporales
      fs.writeFileSync(tempCertPath, certificado.data);
      fs.writeFileSync(officialCertPath, user.certificado);

      // Validar con OpenSSL
      const verifyCommand = `openssl x509 -inform DER -in "${tempCertPath}" -noout -modulus | openssl md5 && openssl x509 -inform DER -in "${officialCertPath}" -noout -modulus | openssl md5`;
      const verificationResult = await new Promise((resolve, reject) => {
        exec(verifyCommand, (error, stdout, stderr) => {
          if (error) return reject(stderr);
          resolve(stdout.trim());
        });
      });

      const [tempHash, storedHash] = verificationResult.split('\n').map((line) => line.split('= ')[1]?.trim());

      if (tempHash !== storedHash) {
        // Incrementar intentos fallidos y actualizar el último intento fallido
        await user.update({
          intentos_fallidos: user.intentos_fallidos + 1,
          ultimo_intento_fallido: new Date(),
        });

        // Verificar si el número de intentos fallidos supera el máximo permitido
        if (user.intentos_fallidos >= MAX_FAILED_ATTEMPTS) {
          const timeRemaining = BLOCK_TIME - (new Date() - user.ultimo_intento_fallido);
          const minutesRemaining = Math.ceil(timeRemaining / 60000);

          if (timeRemaining > 0) {
            return res.status(400).json({
              success: false,
              message: `Demasiados intentos fallidos. Por favor, intente nuevamente en ${minutesRemaining} minuto(s).`,
            });
          }
        }

        await sendLoginFailEmail(user.email, 'Certificado inválido o no coincide');
        return res.status(400).json({ success: false, message: 'Certificado inválido o no coincide' });
      }

      // Si el certificado es válido, reiniciar los intentos fallidos
      await user.update({
        intentos_fallidos: 0,
        ultimo_intento_fallido: null,
      });

      // Certificado válido, proceder con OTP
      const otp = otpGenerator.generate(6, { digits: true });
      otpStore[cedula] = otp;

      await sendOTP(user.email, otp);

      return res.json({
        success: true,
        message: 'OTP enviado al correo',
        role: user.rol, // Aquí devolvemos el rol del usuario
      });
    } finally {
      // Limpiar archivos temporales
      if (fs.existsSync(tempCertPath)) fs.unlinkSync(tempCertPath);
      if (fs.existsSync(officialCertPath)) fs.unlinkSync(officialCertPath);
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};


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

    // Verificar estado del usuario
    const now = Date.now();
    const lastFailedAttempt = new Date(user.ultimo_intento_fallido).getTime();
    const timeSinceLastFailedAttempt = now - lastFailedAttempt;

    if (!user.estado) {
      // Bloqueado: verificar si el tiempo de bloqueo ha terminado
      if (timeSinceLastFailedAttempt >= BLOCK_TIME) {
        // Desbloquear la cuenta automáticamente
        await user.update({ estado: true, intentos_fallidos: 0, ultimo_intento_fallido: null });
      } else {
        const timeRemaining = Math.ceil((BLOCK_TIME - timeSinceLastFailedAttempt) / 60000); // Minutos restantes
        return res.status(400).json({
          success: false,
          message: `Tu cuenta está bloqueada. Inténtalo de nuevo en ${timeRemaining} minuto(s).`,
        });
      }
    }

    // Si el usuario no está bloqueado, procesar el certificado
    const tempDir = path.resolve('C:\\temp\\certificates');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempCertPath = path.join(tempDir, `${cedula}.der`);
    const officialCertPath = path.join(tempDir, `${cedula}_official.der`);

    try {
      fs.writeFileSync(tempCertPath, certificado.data);
      fs.writeFileSync(officialCertPath, user.certificado);

      const verifyCommand = `openssl x509 -inform DER -in "${tempCertPath}" -noout -modulus | openssl md5 && openssl x509 -inform DER -in "${officialCertPath}" -noout -modulus | openssl md5`;
      const verificationResult = await new Promise((resolve, reject) => {
        exec(verifyCommand, (error, stdout, stderr) => {
          if (error) return reject(stderr);
          resolve(stdout.trim());
        });
      });

      const [tempHash, storedHash] = verificationResult.split('\n').map((line) => line.split('= ')[1]?.trim());

      if (tempHash !== storedHash) {
        // Incrementar intentos fallidos y registrar el tiempo
        const updatedUser = await user.update({
          intentos_fallidos: user.intentos_fallidos + 1,
          ultimo_intento_fallido: new Date(),
        });

        // Verificar si alcanza el máximo de intentos
        if (updatedUser.intentos_fallidos >= MAX_FAILED_ATTEMPTS) {
          // Bloquear la cuenta temporalmente
          await user.update({ estado: false });
          return res.status(400).json({
            success: false,
            message: `Demasiados intentos fallidos. Tu cuenta está bloqueada por 2 minutos.`,
          });
        }

        return res.status(400).json({ success: false, message: 'Certificado inválido o no coincide.' });
      }

      // Certificado válido: reiniciar intentos fallidos
      await user.update({
        intentos_fallidos: 0,
        ultimo_intento_fallido: null,
      });

      // Enviar OTP y continuar con el proceso
      const otp = otpGenerator.generate(6, { digits: true });
      otpStore[cedula] = otp;

      await sendOTP(user.email, otp);

      return res.json({
        success: true,
        message: 'OTP enviado al correo',
        role: user.rol, // Devolver el rol del usuario
      });
    } finally {
      // Eliminar archivos temporales
      if (fs.existsSync(tempCertPath)) fs.unlinkSync(tempCertPath);
      if (fs.existsSync(officialCertPath)) fs.unlinkSync(officialCertPath);
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};


// Verificar OTP
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
