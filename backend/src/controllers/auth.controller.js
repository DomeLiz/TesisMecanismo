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

const otpStore = {}; // Almacenamiento temporal para OTPs

// Login de usuario con certificado y generación de OTP
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
        await sendLoginFailEmail(user.email, 'Certificado inválido o no coincide');
        return res.status(400).json({ success: false, message: 'Certificado inválido o no coincide' });
      }

      // Certificado válido, proceder con OTP
      const otp = otpGenerator.generate(6, { digits: true });
      otpStore[cedula] = otp;

      await sendOTP(user.email, otp);

      return res.json({
        success: true,
        message: 'OTP enviado al correo',
        role: user.role,
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

    if (!user || !user.certificado) {
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
        await sendLoginFailEmail(user.email, 'Certificado inválido o no coincide');
        return res.status(400).json({ success: false, message: 'Certificado inválido o no coincide' });
      }

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
