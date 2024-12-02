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

const sendCustodianInvitation = async (to, personaNombre, token) => {
  try {
    const confirmationLink = `${process.env.APP_URL}/confirm-custodian/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Solicitud para ser custodio',
      text: `
        Hola,

        ${personaNombre} te ha propuesto como custodio. Para aceptar esta solicitud, por favor haz clic en el siguiente enlace:

        ${confirmationLink}

        Si no aceptas la solicitud en un plazo de 24 horas, esta será cancelada automáticamente.

        Gracias,
        El equipo.
      `,
    });

    console.log('Correo de invitación de custodio enviado correctamente.');
  } catch (error) {
    console.error('Error al enviar la invitación al custodio:', error);
    throw new Error('Error al enviar la invitación al custodio');
  }
};

module.exports = { 
  sendOTP, 
  sendLoginFailEmail, 
  sendOtpFailEmail, 
  sendFiles, 
  sendCustodianInvitation
};



module.exports = { sendOTP, sendLoginFailEmail, sendOtpFailEmail, sendFiles, sendCustodianInvitation };
