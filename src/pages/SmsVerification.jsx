import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SmsVerification.css';

const SmsVerification = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutos en segundos
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const tempToken = localStorage.getItem('tempToken');
            if (!tempToken) {
                navigate('/');
                return;
            }

            const response = await fetch('http://localhost:3001/users/verify-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tempToken}`
                },
                body: JSON.stringify({ code })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar el token final y datos del usuario
                localStorage.removeItem('tempToken');
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirigir a la selección de perfil
                navigate('/profile-select');
            } else {
                setError(data.error || 'Error al verificar el código');
            }
        } catch (error) {
            setError('Error de conexión');
        }
    };

    const handleResendCode = async () => {
        try {
            const response = await fetch('http://localhost:3001/users/resend-sms', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('tempToken')}`
                }
            });

            if (response.ok) {
                setTimeLeft(600); // Reiniciar el temporizador
                setError('');
            } else {
                const data = await response.json();
                setError(data.error || 'Error al reenviar el código');
            }
        } catch (error) {
            setError('Error de conexión');
        }
    };

    return (
        <div className="sms-verification-container">
            <div className="sms-verification-card">
                <h1>Verificación por SMS</h1>
                <p>Hemos enviado un código de verificación a tu teléfono</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="code-input-container">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Ingresa el código"
                            maxLength={6}
                            pattern="[0-9]*"
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    
                    <p className="timer">Tiempo restante: {formatTime(timeLeft)}</p>
                    
                    <button type="submit" className="verify-button">
                        Verificar
                    </button>
                </form>

                {timeLeft === 0 && (
                    <button onClick={handleResendCode} className="resend-button">
                        Reenviar código
                    </button>
                )}
            </div>
        </div>
    );
};

export default SmsVerification; 