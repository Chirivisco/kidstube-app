import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Main_profile_dashboard.css";
import { Navbar, Nav, NavDropdown, Modal, Button, Form } from "react-bootstrap";
import { FaUserCircle, FaCog, FaSignOutAlt, FaEdit, FaTrash, FaList, FaMusic, FaUsers } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";

export default function MainProfileDashboard() {
    // Estado para almacenar los perfiles y playlists obtenidos del servidor
    const [profiles, setProfiles] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedProfiles, setSelectedProfiles] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Obtiene el perfil seleccionado del almacenamiento local
    const selectedProfile = JSON.parse(localStorage.getItem("selectedProfile"));

    // Efecto para obtener los datos del dashboard al cargar el componente
    useEffect(() => {
        if (!selectedProfile) {
            navigate("/profile-select");
            return;
        }

        if (selectedProfile.role !== "main") {
            navigate("/restricted-dashboard");
            return;
        }

        const fetchDashboardData = async () => {
            const token = localStorage.getItem("token");
            const tokenProfile = localStorage.getItem("token_profile");
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?.id;

            if (!token || !userId || !tokenProfile) {
                setError("No se encontró un token válido.");
                navigate("/");
                return;
            }

            try {
                // Verificar si ya se ha cargado la data
                if (profiles.length > 0 && playlists.length > 0) return; // Evitar que se recarguen

                // Realiza la solicitud al servidor para obtener los perfiles del usuario
                const profilesResponse = await fetch(
                    `http://localhost:3001/profiles/user/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (profilesResponse.ok) {
                    setProfiles(await profilesResponse.json());
                } else {
                    console.error("Error al obtener perfiles");
                }

                // Realiza la solicitud al servidor para obtener las playlists del usuario
                const playlistsResponse = await fetch(
                    `http://localhost:3001/api/playlists/user/${userId}`,
                    {
                        method: "GET",
                        headers: { Authorization: `Bearer ${tokenProfile}` },
                    }
                );

                if (playlistsResponse.ok) {
                    const data = await playlistsResponse.json();
                    setPlaylists(data);
                } else {
                    setError("Error al obtener playlists");
                    console.error("Error al obtener playlists", playlistsResponse);
                }
            } catch (error) {
                console.error("Error de conexión", error);
            }
        };

        fetchDashboardData();
    }, [selectedProfile]); // solo depende de selectedProfile


    // Maneja la salida del perfil seleccionado
    const handleExitProfile = () => {
        localStorage.removeItem("selectedProfile");
        navigate("/profile-select");
    };

    // Maneja el cierre de sesión del usuario
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("selectedProfile");
        navigate("/");
    };

    // Maneja la eliminación de un perfil
    const handleDeleteProfile = async (profileId) => {
        const confirmDelete = window.confirm("¿Estás seguro de eliminar este perfil?");
        const tokenProfile = localStorage.getItem("token_profile");
        if (!confirmDelete) return;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:3001/profiles/${profileId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${tokenProfile}` },
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

    // Maneja la creación de una nueva playlist
    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim() || selectedProfiles.length === 0) {
            setErrorMessage("Debe ingresar un nombre válido y seleccionar al menos un perfil.");
            return;
        }

        setErrorMessage("");
        console.log("Enviando datos al backend:", {
            name: newPlaylistName,
            profiles: selectedProfiles
        });

        try {
            const tokenProfile = localStorage.getItem("token_profile");
            const response = await fetch("http://localhost:3001/api/playlists", {
                method: "POST",
                headers: {Authorization: `Bearer ${tokenProfile}`, "Content-Type": "application/json"},
                body: JSON.stringify({
                    name: newPlaylistName,
                    profiles: selectedProfiles,
                }),
            });

            if (response.ok) {
                const newPlaylist = await response.json();
                setPlaylists([...playlists, newPlaylist]);
                setShowModal(false);
                setNewPlaylistName("");
                setSelectedProfiles([]); // Limpiar los perfiles seleccionados
            } else {
                console.error("Error al crear la playlist");
            }
        } catch (error) {
            console.error("Error de conexión al crear playlist", error);
        }
    };

    // Maneja la eliminación de una playlist
    const handleDeletePlaylist = async (playlistId) => {
        const confirmDelete = window.confirm("¿Estás seguro de eliminar esta playlist?");
        const tokenProfile = localStorage.getItem("token_profile");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${tokenProfile}` },
            });

            if (response.ok) {
                setPlaylists(playlists.filter((playlist) => playlist._id !== playlistId));
            } else {
                console.error("Error al eliminar la playlist");
            }
        } catch (error) {
            console.error("Error de conexión al eliminar playlist", error);
        }
    };

    return (
        <div id="main-dashboard-container">
            <div id="main-dashboard-header">
                <h1 id="main-dashboard-title">
                    <FaUserCircle /> ¡Hola, {selectedProfile?.fullName}!
                </h1>
                <Dropdown id="main-dashboard-nav-dropdown">
                    <Dropdown.Toggle variant="light" className="main-dashboard-btn">
                        <FaCog /> Configuración
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleExitProfile}>
                            <FaSignOutAlt /> Cerrar sesión
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            <div id="main-dashboard-cards-container">
                <div className="main-dashboard-card">
                    <h2 className="main-card-header">
                        <FaUsers /> Perfiles
                    </h2>
                    <div id="main-profile-list">
                        {profiles.map((profile) => (
                            <div key={profile._id} className="main-profile-item">
                                <div className="main-profile-info">
                                    <div className="main-profile-avatar">
                                        {profile.fullName.charAt(0)}
                                    </div>
                                    <div id="main-profile-pr-nameRole-container">
                                        <h3 className="main-profile-name">{profile.fullName}</h3>
                                        <span className="main-profile-role">
                                            {profile.role === "main" ? "Admin" : "Restringido"}
                                        </span>
                                    </div>
                                </div>
                                <div className="main-profile-actions">
                                    <button
                                        className="main-dashboard-btn main-dashboard-btn-primary"
                                        onClick={() => navigate("/Profile_data", { state: { profile } })}
                                    >
                                        <FaEdit /> Editar
                                    </button>
                                    <button
                                        className="main-dashboard-btn main-dashboard-btn-danger"
                                        onClick={() => handleDeleteProfile(profile._id)}
                                    >
                                        <FaTrash /> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="main-dashboard-card">
                    <h2 className="main-card-header">
                        <FaList /> Playlists
                    </h2>
                    <div id="main-playlist-list">
                        {playlists.map((playlist) => (
                            <div key={playlist._id} className="main-playlist-item">
                                <div className="main-playlist-info">
                                    <div className="main-playlist-icon">
                                        <FaMusic />
                                    </div>
                                    <h3 className="main-playlist-name">{playlist.name}</h3>
                                </div>
                                <div className="main-playlist-actions">
                                    <button
                                        className="main-dashboard-btn main-dashboard-btn-primary"
                                        onClick={() => navigate("/playlist-details", { state: { playlist } })}
                                    >
                                        <FaEdit /> Editar
                                    </button>
                                    <button
                                        className="main-dashboard-btn main-dashboard-btn-danger"
                                        onClick={() => handleDeletePlaylist(playlist._id)}
                                    >
                                        <FaTrash /> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal id="main-dashboard-modal" show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Nueva Playlist</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="form-label">Nombre de la Playlist</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ingresa el nombre"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                className="form-control"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="form-label">Seleccionar Perfiles</Form.Label>
                            {profiles.map((profile) => (
                                <Form.Check
                                    key={profile._id}
                                    type="checkbox"
                                    label={profile.fullName}
                                    checked={selectedProfiles.includes(profile._id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedProfiles([...selectedProfiles, profile._id]);
                                        } else {
                                            setSelectedProfiles(selectedProfiles.filter(id => id !== profile._id));
                                        }
                                    }}
                                    className="form-check"
                                />
                            ))}
                        </Form.Group>
                        {errorMessage && (
                            <div className="alert alert-danger" role="alert">
                                {errorMessage}
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleCreatePlaylist}>
                        Crear
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}