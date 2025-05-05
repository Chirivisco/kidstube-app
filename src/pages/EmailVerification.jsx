import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../css/EmailVerification.css';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const status = searchParams.get('status');
        const errorMessage = searchParams.get('message');

        if (status === 'success') {
            setStatus('success');
            setMessage('¡Email verificado exitosamente!');
            setTimeout(() => {
                navigate('/');
            }, 5000);
        } else if (status === 'error') {
            setStatus('error');
            setMessage(errorMessage || 'Error al verificar el email');
        } else {
            setStatus('error');
            setMessage('Estado de verificación no válido');
        }
    }, [searchParams, navigate]);

    return (
        <div className="verification-container">
            <div className="verification-card">
                <h1>Verificación de Email</h1>
                
                {status === 'success' && (
                    <div className="success">
                        <i className="fas fa-check-circle"></i>
                        <p>{message}</p>
                        <p>Serás redirigido al login en breve...</p>
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="error">
                        <i className="fas fa-exclamation-circle"></i>
                        <p>{message}</p>
                        <button onClick={() => navigate('/')}>
                            Volver al Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailVerification; 