import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Main_profile_dashboard.css";

export default function MainProfileDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const navigate = useNavigate();

  // Obtener perfil seleccionado de localStorage
  const selectedProfile = JSON.parse(localStorage.getItem("selectedProfile"));

  useEffect(() => {
    // Si no hay perfil seleccionado, redirige a selección de perfiles
    if (!selectedProfile) {
      navigate("/profile-select");
      return;
    }

    // 🚨 Verificar si el perfil tiene rol "main", si no, lo redirige al home
    if (selectedProfile.role !== "main") {
      navigate("/home");
      return;
    }

    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      if (!token || !userId) {
        navigate("/");
        return;
      }

      try {
        // Obtener perfiles
        const profilesResponse = await fetch(
          `http://localhost:3001/profiles/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (profilesResponse.ok) {
          setProfiles(await profilesResponse.json());
        } else {
          console.error("Error al obtener perfiles");
        }

        // Obtener playlists
        const playlistsResponse = await fetch(
          `http://localhost:3001/playlists/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (playlistsResponse.ok) {
          setPlaylists(await playlistsResponse.json());
        } else {
          console.error("Error al obtener playlists");
        }
      } catch (error) {
        console.error("Error de conexión", error);
      }
    };

    fetchDashboardData();
  }, [navigate, selectedProfile]);

  // 🚀 Salir del perfil (borra solo el perfil seleccionado)
  const handleExitProfile = () => {
    localStorage.removeItem("selectedProfile");
    navigate("/profile-select");
  };

  // 🔴 Cerrar sesión (borra token y usuario)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedProfile");
    navigate("/");
  };

  return (
    <div className="container-fluid dashboard-container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Bienvenido, {selectedProfile?.fullName}!</h1>
        <div>
          <button className="btn btn-warning me-2" onClick={handleExitProfile}>
            Salir del Perfil
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="row">
        {/* Sección de Perfiles */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header">Perfiles</div>
            <div className="card-body">
              <ul className="list-group">
                {profiles.map((profile) => (
                  <li key={profile._id} className="list-group-item d-flex justify-content-between align-items-center">
                    {profile.fullName}
                    <span className="badge bg-primary">
                      {profile.role === "main" ? "Admin" : "Restringido"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sección de Playlists */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header">Playlists</div>
            <div className="card-body">
              <ul className="list-group">
                {playlists.map((playlist) => (
                  <li key={playlist._id} className="list-group-item d-flex justify-content-between align-items-center">
                    {playlist.name}
                    <span className="badge bg-secondary">{playlist.videos.length} videos</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de agregar perfil */}
      <div className="text-center mt-4">
        <button className="btn btn-success">Agregar Perfil</button>
        <button className="btn btn-primary mx-2">Crear Playlist</button>
      </div>
    </div>
  );
}
