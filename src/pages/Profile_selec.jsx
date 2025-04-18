import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Profile_selec.css";

export default function ProfileSelec() {
  const [profiles, setProfiles] = useState([]); // Lista de perfiles
  const [selectedProfileId, setSelectedProfileId] = useState(null); // ID del perfil seleccionado
  const [pin, setPin] = useState(""); // PIN ingresado por el usuario
  const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error para el PIN
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      const token = localStorage.getItem("token"); // Obtener el token del usuario
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      if (!token || !userId) {
        navigate("/"); // Si no hay token o usuario, redirige al login
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3001/profiles/user/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Usar el token del usuario
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfiles(data); // Guardar los perfiles obtenidos
        } else {
          console.error("Error al obtener perfiles");
        }
      } catch (error) {
        console.error("Error de conexión", error);
      }
    };

    fetchProfiles(); // Llamar la función para obtener los perfiles
  }, [navigate]);

  const handleProfileSelect = (profileId) => {
    // Establece el perfil seleccionado y reinicia el PIN y el mensaje de error
    setSelectedProfileId(profileId);
    setPin("");
    setErrorMessage("");
  };

  const handlePinSubmit = async (profile) => {
    if (pin === profile.pin) {
      // Si el PIN es correcto, guarda el perfil seleccionado

      // Ahora hacemos la llamada para obtener el token de perfil
      const token = localStorage.getItem("token"); // Obtener el token del usuario
      try {
        const response = await fetch("http://localhost:3001/profiles/select-profile", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Mandamos el token del usuario
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profileId: profile._id }), // Enviamos el ID del perfil seleccionado
        });

        if (response.ok) {
          const data = await response.json();
          const tokenProfile = data.token_profile; // Suponiendo que el token de perfil se devuelve aquí

          // Guardamos el token de perfil en localStorage
          localStorage.setItem("token_profile", tokenProfile);

          // También guardamos el perfil seleccionado en el localStorage
          localStorage.setItem("selectedProfile", JSON.stringify(profile));

          // Navegamos al dashboard
          navigate("/main-dashboard");
        } else {
          setErrorMessage("Hubo un error al seleccionar el perfil. Inténtalo de nuevo.");
        }
      } catch (error) {
        console.error("Error al seleccionar el perfil", error);
        setErrorMessage("Hubo un error al seleccionar el perfil. Inténtalo de nuevo.");
      }
    } else {
      // Si el PIN es incorrecto, muestra un mensaje de error
      setErrorMessage("PIN incorrecto. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="container-fluid profile-container">
      <h1 className="text-center">¿Quién está viendo?</h1>
      <div className="row justify-content-center">
        {profiles.map((profile) => (
          <div key={profile._id} className="profile-wrapper">
            <div
              className="col-6 col-md-3 profile-card"
              onClick={() => handleProfileSelect(profile._id)}
            >
              <img
                src={
                  profile.avatar.startsWith("http")
                    ? profile.avatar
                    : `http://localhost:3001/${profile.avatar.replace(/\\/g, "/").replace(/^\/?/, "")}`
                }
                alt={profile.fullName}
                className="profile-avatar"
              />
              <h2 className="profile-name">{profile.fullName}</h2>
            </div>

            {/* Mostrar el input del PIN si este perfil está seleccionado */}
            {selectedProfileId === profile._id && (
              <div className="pin-input-container">
                <input
                  type="password"
                  className="form-control pin-input"
                  placeholder="Ingresa tu PIN"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => handlePinSubmit(profile)} // Llamar a handlePinSubmit para seleccionar el perfil
                >
                  Entrar
                </button>
                {errorMessage && (
                  <p className="text-danger mt-2">{errorMessage}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
