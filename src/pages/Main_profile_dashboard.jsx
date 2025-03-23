import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Main_profile_dashboard.css";

export default function MainProfileDashboard() {
    const [profiles, setProfiles] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const navigate = useNavigate();

    const selectedProfile = JSON.parse(localStorage.getItem("selectedProfile"));

    useEffect(() => {
        if (!selectedProfile) {
            navigate("/profile-select");
            return;
        }

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
                const profilesResponse = await fetch(
                    `http://localhost:3001/profiles/user/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (profilesResponse.ok) {
                    setProfiles(await profilesResponse.json());
                } else {
                    console.error("Error al obtener perfiles");
                }

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

    const handleExitProfile = () => {
        localStorage.removeItem("selectedProfile");
        navigate("/profile-select");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("selectedProfile");
        navigate("/");
    };

    const handleDeleteProfile = async (profileId) => {
        const confirmDelete = window.confirm("¿Estás seguro de eliminar este perfil?");
        if (!confirmDelete) return;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:3001/profiles/${profileId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setProfiles(profiles.filter((profile) => profile._id !== profileId));
            } else {
                console.error("Error al eliminar perfil");
            }
        } catch (error) {
            console.error("Error de conexión al eliminar perfil", error);
        }
    };

    return (
        <div className="container-fluid dashboard-container">
            <div className="d-flex justify-content-between align-items-center mx-2 my-4 header-container">
                <h1 className="dashboard-title mx-3">Bienvenido, {selectedProfile?.fullName}!</h1>
                <div className="mx-0">
                    <button className="btn btn-warning me-2" onClick={handleExitProfile}>
                        🚪 Salir del Perfil
                    </button>
                    <button className="btn btn-danger" onClick={handleLogout}>
                        🔒 Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card profile-card">
                        <div className="card-header">Perfiles</div>
                        <div className="card-body">
                            <ul className="list-group">
                                {profiles.map((profile) => (
                                    <li
                                        key={profile._id}
                                        className="list-group-item d-flex justify-content-between align-items-center profile-item"
                                    >
                                        <span>
                                            {profile.fullName} {" "}
                                            <span className="badge bg-primary">
                                                {profile.role === "main" ? "Admin" : "Restringido"}
                                            </span>
                                        </span>
                                        <div>
                                            <button
                                                className="btn btn-sm btn-info me-2"
                                                onClick={() => navigate("/Profile_data", { state: { profile } })}
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDeleteProfile(profile._id)}
                                            >
                                                🗑️ Borrar
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <button className="btn btn-success me-2" onClick={() => navigate("/Profile_data")}>
                        ➕ Agregar Perfil
                    </button>
                </div>

                <div className="col-md-6">
                    <div className="card playlist-card">
                        <div className="card-header">Playlists</div>
                        <div className="card-body">
                            <ul className="list-group">
                                {playlists.map((playlist) => (
                                    <li
                                        key={playlist._id}
                                        className="list-group-item d-flex justify-content-between align-items-center playlist-item"
                                    >
                                        {playlist.name}
                                        <span className="badge bg-secondary">{playlist.videos.length} videos</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <button className="btn btn-primary">🎵 Crear Playlist</button>
                </div>
            </div>

            <div className="text-center mt-4">
                <button className="btn btn-primary">🎵 Crear Playlist</button>
            </div>
        </div>
    );
}
