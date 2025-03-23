import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Profile_data.css";

export default function ProfileData() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileToEdit = location.state?.profile || null;

  const [fullName, setFullName] = useState(profileToEdit?.fullName || "");
  const [pin, setPin] = useState(profileToEdit?.pin || "");
  const [avatar, setAvatar] = useState(profileToEdit?.avatar || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pin.length !== 6 || isNaN(pin)) {
      setError("El PIN debe ser un número de 6 dígitos.");
      return;
    }

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!token || !userId) {
      navigate("/");
      return;
    }

    const profileData = { fullName, pin, avatar, userId };

    try {
      const url = profileToEdit
        ? `http://localhost:3001/profiles/${profileToEdit._id}`
        : "http://localhost:3001/profiles";
      const method = profileToEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        navigate("/Main_profile_dashboard");
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
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          {profileToEdit ? "Guardar Cambios" : "Crear Perfil"}
        </button>
      </form>
    </div>
  );
}
