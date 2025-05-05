import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Profile_data.css";
import { FaUser, FaLock, FaArrowLeft, FaSave, FaImage } from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api";

export default function ProfileData() {
    const navigate = useNavigate();
    const location = useLocation();
    const profileToEdit = location.state?.profile || null;

    const [formData, setFormData] = useState({
        fullName: profileToEdit?.fullName || "",
        pin: profileToEdit?.pin || "",
        avatarUrl: profileToEdit?.avatar || "",
        avatarFile: null
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
    }, [navigate]);

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            avatarFile: e.target.files[0],
            avatarUrl: ""
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.pin.length !== 6 || isNaN(formData.pin)) {
            setError("El PIN debe ser un número de 6 dígitos.");
            return;
        }

        const token = localStorage.getItem("token");
        const tokenProfile = localStorage.getItem("token_profile");
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;

        if (!token || !userId) {
            navigate("/");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("fullName", formData.fullName);
        formDataToSend.append("pin", formData.pin);
        formDataToSend.append("userId", userId);

        if (formData.avatarFile) {
            formDataToSend.append("avatar", formData.avatarFile);
        } else {
            formDataToSend.append("avatar", formData.avatarUrl);
        }

        try {
            const url = profileToEdit
                ? `${API_ENDPOINTS.PROFILES_DIRECT}/${profileToEdit.id}`
                : API_ENDPOINTS.PROFILES_DIRECT;
            const method = profileToEdit ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${tokenProfile}`,
                },
                body: formDataToSend,
            });

            if (response.ok) {
                navigate("/main-dashboard");
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Error al guardar el perfil.");
            }
        } catch (error) {
            console.error("Error:", error);
            setError("Error de conexión con el servidor.");
        }
    };

    return (
        <div id="profile-data-container">
            <div className="profile-data-header">
                <button 
                    className="back-button"
                    onClick={() => navigate("/main-dashboard")}
                >
                    <FaArrowLeft /> Volver
                </button>
                <h1>{profileToEdit ? "Editar Perfil" : "Crear Perfil"}</h1>
            </div>

            <div className="profile-data-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">
                            <FaUser /> Nombre Completo
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            placeholder="Ingresa el nombre del perfil"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="pin">
                            <FaLock /> PIN (6 dígitos)
                        </label>
                        <input
                            type="password"
                            id="pin"
                            value={formData.pin}
                            onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                            required
                            maxLength="6"
                            placeholder="Ingresa un PIN de 6 dígitos"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="avatarUrl">
                            <FaImage /> Avatar (URL)
                        </label>
                        <input
                            type="text"
                            id="avatarUrl"
                            value={formData.avatarUrl}
                            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                            disabled={formData.avatarFile !== null}
                            placeholder="Ingresa la URL de la imagen"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="avatarFile">
                            <FaImage /> Subir Avatar
                        </label>
                        <input
                            type="file"
                            id="avatarFile"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={formData.avatarUrl !== ""}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="save-button">
                        <FaSave /> {profileToEdit ? "Guardar Cambios" : "Crear Perfil"}
                    </button>
                </form>
            </div>
        </div>
    );
}