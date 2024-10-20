import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DatosCustodiados = () => {
    const [personData, setPersonData] = useState(null);
    const [custodiados, setCustodiados] = useState([]); // Estado para almacenar los datos de los custodiados
    const token = localStorage.getItem('token'); // Obtener el token desde localStorage
    const custodioCedula = localStorage.getItem('cedula'); // Obtener la cédula del custodio de localStorage
    const navigate = useNavigate(); // Usar useNavigate para la navegación

    useEffect(() => {
        const fetchPersonData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/persons/cedula/${custodioCedula}`, {
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
                const response = await axios.get(`http://localhost:3000/api/v1/persons/custodian/${custodioCedula}/custodiados`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Respuesta del backend:', response.data); // Verifica los datos que llegan

                // Acceder a los datos correctamente
                if (response.data && response.data.success) {
                    setCustodiados(response.data.custodians || []); // Accedemos a custodians correctamente
                } else {
                    setCustodiados([]); // Si no hay custodiados, vaciar el estado
                }
            } catch (error) {
                console.error('Error al obtener los custodiados:', error);
            }
        };

        fetchPersonData();
        fetchCustodiadosData(); // Verificar los custodiados del custodio
    }, [token, custodioCedula]);

    const handleLogout = () => {
        // Eliminar el token y cédula de localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('cedula');
        // Redirigir al login
        navigate('/login');
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
                    <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                </ul>
            </nav>
            <main className="contenido-principal">
                <h1>Datos de la Persona</h1>
                {personData ? (
                    <div>
                        <p><strong>Nombre:</strong> {personData.name}</p>
                        <p><strong>Dirección:</strong> {personData.address}</p>
                        <p><strong>Teléfono:</strong> {personData.phone}</p>
                        <p><strong>Correo:</strong> {personData.email}</p>
                        <p><strong>Cédula:</strong> {personData.cedula}</p>
                    </div>
                ) : (
                    <p>Cargando datos...</p>
                )}

                <h2>Custodiados</h2>
                {custodiados.length > 0 ? (
                    custodiados.map(custodiado => (
                        <p key={custodiado.cedula}>
                            Usted es custodio de: <strong>{custodiado.name}</strong> (Cédula: {custodiado.cedula})
                        </p>
                    ))
                ) : (
                    <p>Usted no es custodio de ningún usuario.</p>
                )}
            </main>
        </div>
    );
};

export default DatosCustodiados;
