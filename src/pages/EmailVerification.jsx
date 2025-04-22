import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import '../css/EmailVerification.css';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verificando tu email...');

    useEffect(() => {
        const verifyEmail = () => {
            const success = searchParams.get('success');
            const error = searchParams.get('error');
            
            if (success === 'true') {
                setStatus('success');
                setMessage('¡Email verificado exitosamente!');
                // Redirigir a la página principal después de 3 segundos
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else if (error) {
                setStatus('error');
                switch (error) {
                    case 'user_not_found':
                        setMessage('No se encontró el usuario a verificar');
                        break;
                    case 'invalid_token':
                        setMessage('El token de verificación es inválido o ha expirado');
                        break;
                    default:
                        setMessage('Error al verificar el email');
                }
            } else {
                setStatus('error');
                setMessage('No se encontró el token de verificación');
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <Container className="verification-container">
            <div className="verification-card">
                {status === 'verifying' && (
                    <div className="text-center">
                        <Spinner animation="border" role="status" />
                        <p className="mt-3">{message}</p>
                    </div>
                )}
                
                {status === 'success' && (
                    <Alert variant="success" className="text-center">
                        <Alert.Heading>¡Verificación Exitosa!</Alert.Heading>
                        <p>{message}</p>
                        <p>Serás redirigido a la página principal en unos momentos...</p>
                    </Alert>
                )}
                
                {status === 'error' && (
                    <Alert variant="danger" className="text-center">
                        <Alert.Heading>Error de Verificación</Alert.Heading>
                        <p>{message}</p>
                        <button 
                            className="btn btn-primary mt-3"
                            onClick={() => navigate('/')}
                        >
                            Volver a la página principal
                        </button>
                    </Alert>
                )}
            </div>
        </Container>
    );
};

export default EmailVerification; 