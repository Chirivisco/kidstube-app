import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Profile_data.css";

export default function ProfileData() {
  // Hooks de navegación y ubicación de React Router
  const navigate = useNavigate();
  const location = useLocation();
  const profileToEdit = location.state?.profile || null;

  // Estados para manejar los datos del formulario y errores
  const [fullName, setFullName] = useState(profileToEdit?.fullName || "");
  const [pin, setPin] = useState(profileToEdit?.pin || "");
  const [avatarUrl, setAvatarUrl] = useState(profileToEdit?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState("");

  // Efecto para verificar si el usuario está autenticado
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  // Maneja el cambio de archivo para el avatar
  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
    setAvatarUrl(""); // Borra la URL si el usuario sube un archivo
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación del PIN
    if (pin.length !== 6 || isNaN(pin)) {
      setError("El PIN debe ser un número de 6 dígitos.");
      return;
    }

    const token = localStorage.getItem("token");
    const tokenProfile = localStorage.getItem("token_profile")
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    // Verificación de token y userId
    if (!token || !userId) {
      navigate("/");
      return;
    }

    // Creación del FormData para enviar al servidor
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("pin", pin);
    formData.append("userId", userId);

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    } else {
      formData.append("avatar", avatarUrl);
    }

    try {
      // Determina la URL y el método HTTP según si se está editando o creando un perfil
      const url = profileToEdit
        ? `http://localhost:3001/profiles/${profileToEdit._id}`
        : "http://localhost:3001/profiles";
      const method = profileToEdit ? "PATCH" : "POST";

      // Realiza la solicitud al servidor
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${tokenProfile}`,
        },
        body: formData,
      });

      // Manejo de la respuesta del servidor
      if (response.ok) {
        navigate("/main-dashboard");
      } else {
        setError("Error al guardar el perfil.");
      }
    } catch (error) {
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="container profile-form-container">
      <h2 className="text-center">{profileToEdit ? "Editar Perfil" : "Crear Perfil"}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="mb-3">
          <label className="form-label">Nombre Completo</label>
          <input
            type="text"
            className="form-control"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">PIN (6 dígitos)</label>
          <input
            type="password"
            className="form-control"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            maxLength="6"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Avatar (URL)</label>
          <input
            type="text"
            className="form-control"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            disabled={avatarFile !== null}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Subir Avatar</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
            disabled={avatarUrl !== ""}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          {profileToEdit ? "Guardar Cambios" : "Crear Perfil"}
        </button>
      </form>
    </div>
  );
}