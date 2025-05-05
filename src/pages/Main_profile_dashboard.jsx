import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Main_profile_dashboard.css";
import { Navbar, Nav, NavDropdown, Modal, Button, Form } from "react-bootstrap";
import { FaUserCircle, FaCog, FaSignOutAlt, FaEdit, FaTrash, FaList, FaMusic, FaUsers, FaUserFriends, FaHeadphones, FaPlus } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import { API_ENDPOINTS } from "../config/api";

export default function MainProfileDashboard() {
    const [activeSection, setActiveSection] = useState('profiles'); // 'profiles' o 'playlists'
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
                // Realiza la solicitud al servidor para obtener los perfiles del usuario
                const profilesResponse = await fetch(
                    `http://localhost:3002/graphql`,
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
                if (profilesResponse.ok) {
                    const result = await profilesResponse.json();
                    if (result.data && result.data.profilesByUser) {
                        setProfiles(result.data.profilesByUser);
                    } else {
                        console.error("Error en la respuesta GraphQL:", result);
                    }
                } else {
                    console.error("Error al obtener perfiles:", await profilesResponse.text());
                }

                // Realiza la solicitud al servidor para obtener las playlists del usuario
                const playlistsResponse = await fetch(
                    `http://localhost:3002/graphql`,
                    { 
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${tokenProfile}`
                        },
                        body: JSON.stringify({
                            query: `
                                query GetPlaylistsByUser($userId: ID!) {
                                    user(id: $userId) {
                                        profiles {
                                            id
                                            playlists {
                                                id
                                                name
                                                description
                                                profiles {
                                                    id
                                                    fullName
                                                }
                                                videos {
                                                    id
                                                    name
                                                    url
                                                }
                                            }
                                        }
                                    }
                                }
                            `,
                            variables: {
                                userId: userId
                            }
                        })
                    }
                );

                if (playlistsResponse.ok) {
                    const result = await playlistsResponse.json();
                    if (result.data && result.data.user) {
                        // Extraer todas las playlists de todos los perfiles del usuario
                        const allPlaylists = result.data.user.profiles.reduce((acc, profile) => {
                            return [...acc, ...profile.playlists];
                        }, []);
                        setPlaylists(allPlaylists);
                    } else {
                        console.error("Error en la respuesta GraphQL:", result);
                    }
                } else {
                    setError("Error al obtener playlists");
                    console.error("Error al obtener playlists:", await playlistsResponse.text());
                }
            } catch (error) {
                console.error("Error de conexión", error);
            }
        };

        fetchDashboardData();
    }, []); // Solo se ejecuta al montar el componente


    // Maneja la salida del perfil seleccionado
    const handleExitProfile = () => {
        localStorage.removeItem("selectedProfile");
        navigate("/profile-select");
    };

    // Maneja el cierre de sesión del usuario
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("token_profile");
        localStorage.removeItem("selectedProfile");
        localStorage.removeItem("user");
        navigate("/");
    };

    // Maneja la eliminación de un perfil
    const handleDeleteProfile = async (profileId) => {
        if (!profileId) {
            console.error("ID de perfil no válido");
            return;
        }

        const confirmDelete = window.confirm("¿Estás seguro de eliminar este perfil?");
        const tokenProfile = localStorage.getItem("token_profile");
        if (!confirmDelete) return;

        try {
            console.log("Eliminando perfil:", profileId);
            const response = await fetch(`${API_ENDPOINTS.PROFILES_DIRECT}/${profileId}`, {
                method: "DELETE",
                headers: { 
                    Authorization: `Bearer ${tokenProfile}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                setProfiles(profiles.filter((profile) => profile.id !== profileId));
            } else {
                const errorData = await response.json();
                console.error("Error al eliminar perfil:", errorData.error);
            }
        } catch (error) {
            console.error("Error de conexión al eliminar perfil:", error);
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
            const response = await fetch(`${API_ENDPOINTS.PLAYLISTS}`, {
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
            const response = await fetch(`${API_ENDPOINTS.PLAYLISTS}/${playlistId}`, {
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

    const handleChangeProfile = () => {
        localStorage.removeItem("selectedProfile");
        localStorage.removeItem("token_profile");
        navigate("/profile-select");
    };

    return (
        <div id="main-dashboard-container">
            <div id="main-dashboard-sidebar">
                <button 
                    className={activeSection === 'profiles' ? 'active' : ''}
                    onClick={() => setActiveSection('profiles')}
                >
                    <FaUserFriends /> Perfiles
                </button>
                <button 
                    className={activeSection === 'playlists' ? 'active' : ''}
                    onClick={() => setActiveSection('playlists')}
                >
                    <FaHeadphones /> Playlists
                </button>
            </div>

            <div id="main-dashboard-content">
                <div id="main-dashboard-header">
                    <h1 id="main-dashboard-title">
                        <FaUserCircle /> ¡Hola, {selectedProfile?.fullName}!
                    </h1>
                    <Dropdown id="main-dashboard-nav-dropdown">
                        <Dropdown.Toggle variant="light" className="main-dashboard-btn">
                            <FaCog /> Configuración
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={handleChangeProfile}>
                                <FaUserFriends /> Cambiar perfil
                            </Dropdown.Item>
                            <Dropdown.Item onClick={handleLogout}>
                                <FaSignOutAlt /> Cerrar sesión
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                {activeSection === 'profiles' && (
                    <div className="main-dashboard-card">
                        <div className="main-card-header-container">
                            <h2 className="main-card-header">
                                <FaUsers /> Perfiles
                            </h2>
                            <button 
                                className="main-dashboard-btn main-dashboard-btn-primary"
                                onClick={() => navigate("/Profile_data")}
                            >
                                <FaPlus /> Agregar Perfil
                            </button>
                        </div>
                        <div id="main-profile-list">
                            {profiles.map((profile) => (
                                <div key={profile.id} className="main-profile-item">
                                    <div className="main-profile-info">
                                        <div className="main-profile-avatar">
                                            {profile.avatar ? (
                                                <img 
                                                    src={
                                                        profile.avatar.startsWith("http")
                                                            ? profile.avatar
                                                            : `http://localhost:3001/${profile.avatar.replace(/\\/g, "/").replace(/^\/?/, "")}`
                                                    }
                                                    alt={profile.fullName.charAt(0)}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.textContent = profile.fullName.charAt(0);
                                                    }}
                                                />
                                            ) : (
                                                profile.fullName.charAt(0)
                                            )}
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
                                            onClick={() => handleDeleteProfile(profile.id)}
                                        >
                                            <FaTrash /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'playlists' && (
                    <div className="main-dashboard-card">
                        <div className="main-card-header-container">
                            <h2 className="main-card-header">
                                <FaList /> Playlists
                            </h2>
                            <button 
                                className="main-dashboard-btn main-dashboard-btn-primary"
                                onClick={() => setShowModal(true)}
                            >
                                <FaPlus /> Crear Playlist
                            </button>
                        </div>
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
                                            onClick={() => navigate(`/update_playlist/${playlist._id}`)}
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
                )}
            </div>

            <Modal id="main-dashboard-modal" show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Nueva Playlist</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="form-label">Nombre de la Playlist</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ingresa el nombre"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                className="form-control"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="form-label">Seleccionar Perfiles</Form.Label>
                            <div className="profiles-checkbox-container">
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
                            </div>
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
                        Crear Playlist
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}