import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DatosCustodiados = () => {
    const [personData, setPersonData] = useState(null);
    const [custodiados, setCustodiados] = useState([]);
    const [showOtpBox, setShowOtpBox] = useState(null); // Estado para manejar la caja de OTP
    const [otp, setOtp] = useState(''); // Estado para el OTP ingresado
    const [selectedCustodiado, setSelectedCustodiado] = useState(null); // Custodiado seleccionado para eliminar
    const [errorMessage, setErrorMessage] = useState(''); // Mensajes de error
    const [otpSent, setOtpSent] = useState(false); // Estado para saber si el OTP fue enviado

    const token = localStorage.getItem('token');
    const custodioCedula = localStorage.getItem('cedula');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPersonData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/usuarios/cedula/${custodioCedula}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPersonData(response.data);
            } catch (error) {
                console.error('Error al obtener los datos de la persona:', error);
            }
        };

        const fetchCustodiadosData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/usuarios/custodiados/${custodioCedula}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data && Array.isArray(response.data.custodiados)) {
                    setCustodiados(response.data.custodiados);
                } else {
                    console.error('No se encontraron custodiados o la respuesta tiene formato incorrecto');
                    setCustodiados([]);
                }
            } catch (error) {
                console.error('Error al obtener los custodiados:', error);
            }
        };

        fetchPersonData();
        fetchCustodiadosData();
    }, [token, custodioCedula]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('cedula');
        navigate('/login');
    };

    const sendOtp = async (email) => {
        try {
            await axios.post(
                `http://localhost:3000/api/v1/auth/send-otp`,
                { email },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setOtpSent(true);
            setErrorMessage('');
        } catch (error) {
            console.error('Error al enviar el OTP:', error);
            setErrorMessage('Error al enviar el OTP. Por favor, inténtalo de nuevo.');
        }
    };

    const verifyOtp = async () => {
        try {
            const response = await axios.post(
                `http://localhost:3000/api/v1/auth/verify-otp-custodiado`,
                { email: selectedCustodiado.email, otp },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data.success;
        } catch (error) {
            console.error('Error al verificar OTP:', error);
            setErrorMessage('OTP incorrecto o expirado. Por favor, intenta nuevamente.');
            return false;
        }
    };

    const eliminarDatosUsuario = async (id) => {
        try {
            const response = await axios.delete(
                `http://localhost:3000/api/v1/usuarios/eliminar/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error al eliminar los datos del usuario:', error);
            throw new Error('No se pudieron eliminar los datos del usuario. Inténtalo nuevamente.');
        }
    };

    const handleDeleteClick = async (custodiado) => {
        setSelectedCustodiado(custodiado);
        setOtp('');
        setErrorMessage('');
        setOtpSent(false);

        // Enviar OTP al correo del custodiado
        await sendOtp(custodiado.email);
        setShowOtpBox(custodiado.cedula);
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
        setErrorMessage('');
    };

    const handleConfirmDelete = async () => {
        if (!otpSent) {
            setErrorMessage('Primero debes enviar el OTP.');
            return;
        }

        const isOtpValid = await verifyOtp();
        if (isOtpValid) {
            try {
                await eliminarDatosUsuario(selectedCustodiado.usuario_id);

                // Actualizar la lista de custodiados
                setCustodiados(custodiados.filter(c => c.usuario_id !== selectedCustodiado.usuario_id));
                setShowOtpBox(null);
                setOtp('');
                setErrorMessage('');
            } catch (error) {
                console.error('Error al eliminar los datos del usuario:', error);
                setErrorMessage('Error al eliminar los datos del usuario. Inténtalo nuevamente.');
            }
        }
    };

    return (
        <div className="datos-container">
            <nav className="menu-lateral">
                <h2>Menú</h2>
                <ul>
                    <li><button onClick={() => navigate('/inicio')}>Inicio</button></li>
                    <li><button onClick={() => navigate('/datos')}>Datos</button></li>
                    <li><button onClick={() => navigate('/asignacion-custodio')}>Asignación de Custodio</button></li>
                    <li><button onClick={() => navigate('/datos-custodiados')}>Datos Custodiados</button></li>
                    <li><button onClick={() => navigate('/eliminar-datos')}>Eliminar Datos Custodiados</button></li>
                    <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                </ul>
            </nav>
            <main className="contenido-principal">
                <h1>Datos de la Persona</h1>
                {personData ? (
                    <div>
                        <p><strong>ID:</strong> {personData.usuario_id}</p>
                        <p><strong>Nombre:</strong> {personData.nombre}</p>
                        <p><strong>Apellido:</strong> {personData.apellido}</p>
                        <br></br>
                    </div>
                ) : (
                    <p>Cargando datos...</p>
                )}

                <h2>Custodiados</h2>
                {custodiados.length > 0 ? (
                    custodiados.map(custodiado => (
                        <div key={custodiado.cedula} className="custodiado-datos">
                            <br />
                            <p><strong>Nombre:</strong> {custodiado.nombre}</p>
                            <p><strong>Dirección:</strong> {custodiado.direccion}</p>
                            <p><strong>Teléfono:</strong> {custodiado.telefono}</p>
                            <p><strong>Correo:</strong> {custodiado.email}</p>
                            <p><strong>Cédula:</strong> {custodiado.cedula}</p>
                            <button onClick={() => handleDeleteClick(custodiado)}>Eliminar Datos del Custodiado</button>
                            {showOtpBox === custodiado.cedula && (
                                <div className="otp-box">
                                    <label>Ingresa el OTP:</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={handleOtpChange}
                                    />
                                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                                    <button onClick={handleConfirmDelete}>Confirmar Eliminación</button>
                                </div>
                            )}
                            <br />
                        </div>
                    ))
                ) : (
                    <p>Usted no es custodio de ningún usuario.</p>
                )}
            </main>
        </div>
    );
};

export default DatosCustodiados;