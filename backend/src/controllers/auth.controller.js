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
    const certificado = req.files?.certificado; // Certificado enviado como archivo

    if (!certificado) {
      return res.status(400).json({ success: false, message: 'Certificado no proporcionado' });
    }

    const user = await userservice.findByCedula(cedula);

    if (!user) {
      await sendLoginFailEmail(cedula, 'Usuario no encontrado');
      return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Crear directorio temporal para guardar el certificado recibido
    const tempDir = path.resolve('C:\\temp\\certificates');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Guardar certificado recibido en un archivo temporal
    const tempCertPath = path.join(tempDir, `${cedula}.crt`);
    fs.writeFileSync(tempCertPath, certificado.data);

    // Obtener el certificado oficial desde la base de datos
    const person = await usuarioService.findByCedula(cedula);

    if (!person || !person.certificado) {
      fs.unlinkSync(tempCertPath); // Limpiar archivo temporal
      await sendLoginFailEmail(person?.email || 'admin@example.com', 'Certificado oficial no encontrado');
      return res.status(400).json({ success: false, message: 'Certificado oficial no encontrado en la base de datos' });
    }

    // Guardar el certificado oficial en un archivo temporal para comparación
    const officialCertPath = path.join(tempDir, `${cedula}_official.der`); // DER es el formato usado
    fs.writeFileSync(officialCertPath, person.certificado); // Binary data del certificado oficial

    // Validar certificado usando OpenSSL
    const verifyCommand = `openssl x509 -in "${tempCertPath}" -noout -modulus | openssl md5 && openssl x509 -in "${officialCertPath}" -noout -modulus | openssl md5`;

    const verificationResult = await new Promise((resolve, reject) => {
      exec(verifyCommand, (error, stdout, stderr) => {
        if (error) {
          return reject(`Error ejecutando OpenSSL: ${stderr}`);
        }
        resolve(stdout.trim());
      });
    });

    // Comparar los hashes de los certificados
    const [tempHash, storedHash] = verificationResult.split('\n').map((line) => line.split('= ')[1]?.trim());

    if (tempHash !== storedHash) {
      fs.unlinkSync(tempCertPath); // Limpiar archivo temporal
      fs.unlinkSync(officialCertPath);

      // Enviar alerta por intento fallido
      await sendLoginFailEmail(person.email, 'Certificado inválido o no coincide');

      return res.status(400).json({ success: false, message: 'Certificado inválido o no coincide' });
    }

    // Continuar con el flujo de OTP si el certificado es válido
    const email = person.email;

    if (!email) {
      fs.unlinkSync(tempCertPath); // Limpiar archivo temporal
      fs.unlinkSync(officialCertPath);
      return res.status(400).json({ success: false, message: 'Correo electrónico no encontrado' });
    }

    // Generar y enviar OTP
    const otp = otpGenerator.generate(6, { digits: true });
    otpStore[cedula] = otp;

    await sendOTP(email, otp);

    // Limpiar archivos temporales
    fs.unlinkSync(tempCertPath);
    fs.unlinkSync(officialCertPath);

    // Incluir el rol del usuario en la respuesta
    res.json({
      success: true,
      message: 'OTP enviado al correo',
      role: person.role, // Asume que el rol del usuario está en `person.role`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
