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

module.exports = { sendOTP };
