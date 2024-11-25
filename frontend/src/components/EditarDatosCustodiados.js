import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditarDatosCustodiados = () => {
    const { state } = useLocation(); // Obtener los datos del custodiado desde el estado
    const { custodiado } = state; // Extraer los datos del custodiado
    const [formData, setFormData] = useState({
        nombre: custodiado.nombre,
        apellido: custodiado.apellido,
        telefono: custodiado.telefono,
        direccion: custodiado.direccion,
        fecha_nacimiento: custodiado.fecha_nacimiento,
        email: custodiado.email, // Correo solo lectura
        cedula: custodiado.cedula, // Cédula solo lectura
    });
    const [otpSent, setOtpSent] = useState(false); // Para manejar si el OTP ya fue enviado
    const [otp, setOtp] = useState(''); // Estado para manejar el OTP ingresado por el usuario
    const [errorMessage, setErrorMessage] = useState(''); // Estado para manejar mensajes de error
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // Manejar cambios en los campos del formulario
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Enviar el OTP al correo del custodiado
    const sendOtp = async () => {
        try {
            await axios.post(`http://localhost:3000/api/v1/persons/send-otp`, {
                email: formData.email, // Enviar el OTP al correo del custodiado
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOtpSent(true); // Cambiar el estado para deshabilitar los campos y mostrar el campo de OTP
            setErrorMessage(''); // Limpiar cualquier mensaje de error anterior
        } catch (error) {
            console.error('Error al enviar el OTP:', error);
            setErrorMessage('Error al enviar el OTP. Por favor, inténtalo de nuevo.'); // Mensaje de error
        }
    };

    // Verificar el OTP y, si es correcto, guardar los cambios
    const verifyOtpAndSubmit = async () => {
        try {
            // Verificar el OTP
            await axios.post(`http://localhost:3000/api/v1/persons/verify-otp`, {
                email: formData.email,
                otp, // OTP ingresado por el usuario
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Si la verificación es exitosa, actualiza los datos
            await axios.put(`http://localhost:3000/api/v1/usuarios/cedula/${custodiado.cedula}`, {
                nombre: formData.nombre,
                apellido: formData.apellido,
                telefono: formData.telefono,
                direccion: formData.direccion,
                fecha_nacimiento: formData.fecha_nacimiento,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            navigate('/datos-custodiados');
        } catch (error) {
            console.error('Error al verificar OTP:', error);
            setErrorMessage('OTP incorrecto. Por favor, verifica e inténtalo de nuevo.'); // Mensaje de error para OTP incorrecto
        }
    };

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otpSent) {
            // Si aún no se ha enviado el OTP, envíalo
            await sendOtp();
        } else {
            // Si el OTP ya fue enviado, verifica el OTP y guarda los cambios
            await verifyOtpAndSubmit();
        }
    };

    // Manejar cambios en el campo OTP
    const handleOtpChange = (e) => {
        setOtp(e.target.value);
        setErrorMessage(''); // Limpiar el mensaje de error al cambiar el OTP
    };

    const handleBack = () => {
        // Regresar a la página de datos custodiados
        navigate('/datos-custodiados');
    };

    return (
        <div className="editar-datos-container">
            <h1>Editar Datos del Custodiado</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        disabled={otpSent}
                    />
                </div>
                <div>
                    <label>Apellido</label>
                    <input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        disabled={otpSent}
                    />
                </div>
                <div>
                    <label>Teléfono</label>
                    <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        disabled={otpSent}
                    />
                </div>
                <div>
                    <label>Dirección</label>
                    <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        disabled={otpSent}
                    />
                </div>
                <div>
                    <label>Fecha de Nacimiento</label>
                    <input
                        type="date"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleInputChange}
                        disabled={otpSent}
                    />
                </div>
                <div>
                    <label>Correo</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        readOnly
                    />
                </div>
                <div>
                    <label>Cédula</label>
                    <input
                        type="text"
                        name="cedula"
                        value={formData.cedula}
                        readOnly
                    />
                </div>

                {otpSent ? (
                    <div>
                        <label>Ingresa el OTP que recibiste por correo</label>
                        <input
                            type="text"
                            name="otp"
                            value={otp}
                            onChange={handleOtpChange}
                            required
                        />
                    </div>
                ) : null}

                {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>} {/* Mostrar mensaje de error */}

                <button type="submit">
                    {otpSent ? 'Verificar OTP y Guardar Cambios' : 'Enviar OTP'}
                </button>

                {/* Botón para regresar a la página de Datos Custodiados */}
                <button type="button" onClick={handleBack} style={{ marginLeft: '10px' }}>
                    Volver a Datos Custodiados
                </button>
            </form>
        </div>
    );
};

export default EditarDatosCustodiados;
