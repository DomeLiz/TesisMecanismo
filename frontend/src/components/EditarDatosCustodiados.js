import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditarDatosCustodiados = () => {
    const { state } = useLocation(); // Obtener los datos del custodiado desde el estado
    const { custodiado } = state; // Extraer los datos del custodiado
    const [formData, setFormData] = useState({
        name: custodiado.name,
        address: custodiado.address,
        phone: custodiado.phone,
        email: custodiado.email,
        cedula: custodiado.cedula,
    });
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3000/api/v1/persons/cedula/${custodiado.cedula}`, {
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                // El correo no se puede editar, así que no lo incluyas
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            navigate('/datos-custodiados');
        } catch (error) {
            console.error('Error al actualizar los datos del custodiado:', error);
        }
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
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div>
                    <label>Dirección</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                </div>
                <div>
                    <label>Teléfono</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
                <div>
                    <label>Correo</label>
                    <input type="email" name="email" value={formData.email} readOnly /> {/* El campo de correo es solo lectura */}
                </div>
                <div>
                    <label>Cédula</label>
                    <input type="text" name="cedula" value={formData.cedula} readOnly /> {/* El campo de cédula es solo lectura */}
                </div>
                <button type="submit">Guardar Cambios</button>
                {/* Botón para regresar a la página de Datos Custodiados */}
                <button type="button" onClick={handleBack} style={{ marginLeft: '10px' }}>
                    Volver a Datos Custodiados
                </button>
            </form>
        </div>
    );
};

export default EditarDatosCustodiados;
