// mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (to, otp) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER, 
        to,
        subject: 'Tu código de verificación OTP',
        text: `Tu código OTP es: ${otp}`,
      });
      console.log('OTP enviado correctamente');
    } catch (error) {
      console.error('Error al enviar el OTP:', error);
      throw new Error('Error al enviar el OTP');
    }
  };

 
// Método para enviar correo de login fallido
const sendLoginFailEmail = async (to, reason) => {
  try {
    console.log(`Enviando correo de intento fallido a: ${to}, razón: ${reason}`);
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Intento fallido de inicio de sesión',
      text: `Hubo un intento fallido de inicio de sesión en tu cuenta.\nRazón: ${reason}\nFecha: ${formattedDate}\nHora: ${formattedTime}`,
    });

    console.log('Correo de intento fallido enviado correctamente');
  } catch (error) {
    console.error('Error al enviar el correo de intento fallido:', error);
    throw new Error('Error al enviar el correo de intento fallido');
  }
};

// Método para enviar correo de OTP incorrecto
const sendOtpFailEmail = async (to, cedula) => {
  try {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    console.log(`Intento fallido de verificación de OTP. Fecha: ${formattedDate}, Hora: ${formattedTime}, Cédula: ${cedula}`);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Intento fallido de verificación de OTP',
      text: `Hubo un intento fallido de verificación de OTP en tu cuenta.\nCédula: ${cedula}\nFecha: ${formattedDate}\nHora: ${formattedTime}`,
    });

    console.log('Correo de intento fallido de verificación de OTP enviado correctamente');
  } catch (error) {
    console.error('Error al enviar el correo de intento fallido de OTP:', error);
    throw new Error('Error al enviar el correo de intento fallido de OTP');
  }
};

const sendFiles = async (to, subject, bodyText, attachments) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: bodyText,
      attachments, // Lista de adjuntos
    });
    console.log('Correo con archivos enviado correctamente.');
  } catch (error) {
    console.error('Error al enviar el correo con archivos:', error);
    throw new Error('Error al enviar el correo con archivos adjuntos.');
  }
};


module.exports = { 
  sendOTP, 
  sendLoginFailEmail, 
  sendOtpFailEmail,
  sendFiles, 
};

