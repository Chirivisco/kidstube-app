import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Profile_selec.css";
import { API_ENDPOINTS } from "../config/api";

export default function ProfileSelec() {
  const [profiles, setProfiles] = useState([]); // Lista de perfiles 
  const [selectedProfileId, setSelectedProfileId] = useState(null); // ID del perfil seleccionado 
  const [pinInputs, setPinInputs] = useState({}); // Estado para manejar los PINs de los perfilesindividualmente
  const [errorMessages, setErrorMessages] = useState({}); // Estado para manejar errores de los perfiles individualmente
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      if (!token || !userId) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:4000/graphql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              query: `
                query GetProfilesByUser($userId: ID!) {
                  profilesByUser(userId: $userId) {
                    id
                    fullName
                    pin
                    avatar
                    role
                  }
                }
              `,
              variables: {
                userId: userId
              }
            })
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.profilesByUser) {
            setProfiles(result.data.profilesByUser);
          } else {
            console.error("Error en la respuesta GraphQL:", result);
          }
        } else {
          console.error("Error al obtener perfiles:", await response.text());
        }
      } catch (error) {
        console.error("Error de conexión", error);
      }
    };

    fetchProfiles(); // Llamar la función para obtener los perfiles
  }, [navigate]);

  const handleProfileSelect = (profileId) => {
    setSelectedProfileId(profileId);
    // Limpiar el PIN y mensaje de error solo para el perfil seleccionado
    setPinInputs(prev => ({
      ...prev,
      [profileId]: ""
    }));
    setErrorMessages(prev => ({
      ...prev,
      [profileId]: ""
    }));
  };

  const handlePinChange = (profileId, value) => {
    setPinInputs(prev => ({
      ...prev,
      [profileId]: value
    }));
  };

  const handlePinSubmit = async (profile) => {
    const pin = pinInputs[profile.id];
    
    if (pin === profile.pin) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_ENDPOINTS.PROFILES}/select-profile`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profileId: profile.id }),
        });

        if (response.ok) {
          const data = await response.json();
          const tokenProfile = data.token_profile;

          localStorage.setItem("token_profile", tokenProfile);
          localStorage.setItem("selectedProfile", JSON.stringify(profile));
          navigate("/main-dashboard");
        } else {
          setErrorMessages(prev => ({
            ...prev,
            [profile.id]: "Hubo un error al seleccionar el perfil. Inténtalo de nuevo."
          }));
        }
      } catch (error) {
        console.error("Error al seleccionar el perfil", error);
        setErrorMessages(prev => ({
          ...prev,
          [profile.id]: "Hubo un error al seleccionar el perfil. Inténtalo de nuevo."
        }));
      }
    } else {
      setErrorMessages(prev => ({
        ...prev,
        [profile.id]: "PIN incorrecto. Inténtalo de nuevo."
      }));
    }
  };

  return (
    <div className="container-fluid profile-container">
      <div className="profile-header">
        <h1 className="text-center profile-title">¿Quién está viendo?</h1>
        <p className="text-center profile-subtitle">Selecciona tu perfil para comenzar la aventura</p>
      </div>
      <div className="row justify-content-center profiles-grid">
        {profiles.map((profile) => (
          <div key={profile.id} className="profile-wrapper">
            <div
              className={`col-6 col-md-3 profile-card ${selectedProfileId === profile.id ? 'selected' : ''}`}
              onClick={() => handleProfileSelect(profile.id)}
            >
              <div className="profile-avatar-container">
                <img
                  src={
                    profile.avatar.startsWith("http")
                      ? profile.avatar
                      : `http://localhost:3001/${profile.avatar.replace(/\\/g, "/").replace(/^\/?/, "")}`
                  }
                  alt={profile.fullName}
                  className="profile-avatar"
                />
                {selectedProfileId === profile.id && (
                  <div className="profile-selected-indicator">
                    <span className="selected-icon">✓</span>
                  </div>
                )}
              </div>
              <h2 className="profile-name">{profile.fullName}</h2>
            </div>

            {selectedProfileId === profile.id && (
              <div className="pin-input-container">
                <div className="pin-input-wrapper">
                  <input
                    type="password"
                    className="form-control pin-input"
                    placeholder="Ingresa tu PIN"
                    maxLength={6}
                    value={pinInputs[profile.id] || ""}
                    onChange={(e) => handlePinChange(profile.id, e.target.value)}
                  />
                  <button
                    className="btn btn-primary mt-3 enter-button"
                    onClick={() => handlePinSubmit(profile)}
                  >
                    Entrar
                  </button>
                </div>
                {errorMessages[profile.id] && (
                  <div className="error-message">
                    <p className="text-danger">{errorMessages[profile.id]}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
