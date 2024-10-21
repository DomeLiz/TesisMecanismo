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
        from: process.env.EMAIL_USER, // El correo electrónico desde el que envías el OTP
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
    // Obtén la fecha y hora actual
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString(); // Formatea la fecha
    const formattedTime = currentDate.toLocaleTimeString(); // Formatea la hora
    
    // Registrar en la consola la fecha y hora del intento fallido
    console.log(`Intento de inicio de sesión fallido. Fecha: ${formattedDate}, Hora: ${formattedTime}, Razón: ${reason}`);
    
    // Envía el correo
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



module.exports = { sendOTP, sendLoginFailEmail };
