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
const login = async (req, res) => {
  try {
    console.log('Iniciando login...');
    const { cedula } = req.body;
    console.log(`Cédula recibida: ${cedula}`);

    const certificado = req.files?.certificado; // Certificado enviado como archivo
    console.log('Certificado recibido:', certificado ? 'Sí' : 'No');

    if (!certificado) {
      console.log('Certificado no proporcionado.');
      return res.status(400).json({ success: false, message: 'Certificado no proporcionado' });
    }

    const user = await userservice.findByCedula(cedula);
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');

    if (!user) {
      await sendLoginFailEmail(cedula, 'Usuario no encontrado');
      console.log('Usuario no encontrado.');
      return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Crear directorio temporal para guardar el certificado recibido
    const tempDir = path.resolve('C:\\temp\\certificates');
    if (!fs.existsSync(tempDir)) {
      console.log('Creando directorio temporal...');
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Guardar certificado recibido en un archivo temporal
    const tempCertPath = path.join(tempDir, `${cedula}.crt`);
    fs.writeFileSync(tempCertPath, certificado.data);
    console.log(`Certificado recibido guardado en: ${tempCertPath}`);

    // Obtener el certificado oficial desde la base de datos
    const person = await usuarioService.findByCedula(cedula);
    console.log('Usuario con certificado oficial encontrado:', person ? 'Sí' : 'No');

    if (!person || !person.certificado) {
      fs.unlinkSync(tempCertPath); // Limpiar archivo temporal
      console.log('Certificado oficial no encontrado en la base de datos.');
      return res.status(400).json({ success: false, message: 'Certificado oficial no encontrado en la base de datos' });
    }

    // Guardar el certificado oficial en un archivo temporal para comparación
    const officialCertPath = path.join(tempDir, `${cedula}_official.crt`);
    fs.writeFileSync(officialCertPath, person.certificado); // Binary data del certificado oficial
    console.log(`Certificado oficial guardado en: ${officialCertPath}`);

    // Validar certificado usando OpenSSL
    console.log('Ejecutando comando de validación OpenSSL...');
    const verifyCommand = `openssl x509 -in "${tempCertPath}" -noout -modulus | openssl md5 && openssl x509 -in "${officialCertPath}" -noout -modulus | openssl md5`;
    console.log(`Comando: ${verifyCommand}`);

    const verificationResult = await new Promise((resolve, reject) => {
      exec(verifyCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('Error ejecutando OpenSSL:', stderr);
          return reject(`Error ejecutando OpenSSL: ${stderr}`);
        }
        resolve(stdout.trim());
      });
    });

    console.log('Resultado de OpenSSL:', verificationResult);

    // Comparar los hashes de los certificados
    const [tempHash, storedHash] = verificationResult.split('\n').map((line) => line.split('= ')[1]?.trim());
    console.log(`Hash certificado recibido: ${tempHash}`);
    console.log(`Hash certificado oficial: ${storedHash}`);

    if (tempHash !== storedHash) {
      console.log('Certificado inválido o no coincide.');
      fs.unlinkSync(tempCertPath); // Limpiar archivo temporal
      fs.unlinkSync(officialCertPath);
      return res.status(400).json({ success: false, message: 'Certificado inválido o no coincide' });
    }


    // Continuar con el flujo de OTP si el certificado es válido
    console.log('Certificado validado exitosamente.');

    const email = person.email;

    if (!email) {
      fs.unlinkSync(tempCertPath); // Limpiar archivo temporal
      fs.unlinkSync(officialCertPath);
      console.log('Correo electrónico no encontrado.');
      return res.status(400).json({ success: false, message: 'Correo electrónico no encontrado' });
    }

    // Generar y enviar OTP
    const otp = otpGenerator.generate(6, { digits: true });
    otpStore[cedula] = otp;

    console.log(`OTP generado: ${otp}`);
    await sendOTP(email, otp);

    // Limpiar archivos temporales
    fs.unlinkSync(tempCertPath);
    fs.unlinkSync(officialCertPath);
    console.log('Archivos temporales eliminados.');

    res.json({ success: true, message: 'OTP enviado al correo' });
  } catch (error) {
    console.error('Error en el login con certificado:', error);
    res.status(500).json({ success: false, message: error.message });
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
