import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Profile_selec.css";

export default function ProfileSelec() {
  const [profiles, setProfiles] = useState([]);
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
          `http://localhost:3001/profiles/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProfiles(data);
        } else {
          console.error("Error al obtener perfiles");
        }
      } catch (error) {
        console.error("Error de conexión", error);
      }
    };
    fetchProfiles();
  }, [navigate]);

  const handleProfileSelect = (profile) => {
    localStorage.setItem("selectedProfile", JSON.stringify(profile));
    navigate("/main-dashboard");
  };

  return (
    <div className="container-fluid profile-container">
      <h1 className="text-center">¿Quién está viendo?</h1>
      <div className="row justify-content-center">
        {profiles.map((profile) => (
          <div key={profile._id} className="profile-wrapper">
            <div
              className="col-6 col-md-3 profile-card"
              onClick={() => handleProfileSelect(profile)}
            >
              <img
                src={`http://localhost:3001/${profile.avatar}`}
                alt={profile.fullName}
                className="profile-avatar"
              />
              <h2 className="profile-name">{profile.fullName}</h2>
              <button className="btn btn-primary">Entrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}