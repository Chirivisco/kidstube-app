import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Main_profile_dashboard.css";
import { Navbar, Nav, NavDropdown, Modal, Button, Form } from "react-bootstrap";

export default function MainProfileDashboard() {
    // Estado para almacenar los perfiles y playlists obtenidos del servidor
    const [profiles, setProfiles] = useState([]);
    const [playlists, setPlaylists] = useState([]);
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
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?.id;

            if (!token || !userId) {
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

    // Maneja la creación de una nueva playlist
    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim() || selectedProfiles.length === 0) {
            setErrorMessage("Debe ingresar un nombre válido y seleccionar al menos un perfil.");
            return;
        }

        setErrorMessage("");

        try {
            const response = await fetch("http://localhost:3001/api/playlists", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
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
        <div className="container-fluid dashboard-container">
            <Navbar expand="lg" className="header-container">
                <Navbar.Brand className="dashboard-title mx-3">
                    Bienvenido, {selectedProfile?.fullName}!
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto" id="navigation-bar">
                        <NavDropdown title="⚙️ Opciones" id="basic-nav-dropdown">
                            <NavDropdown.Item onClick={handleExitProfile}>🚪 Salir del Perfil</NavDropdown.Item>
                            <NavDropdown.Item onClick={handleLogout}>🔒 Cerrar Sesión</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

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
                                        <span>
                                            {playlist.name}{" "}
                                            <span className="badge bg-secondary">
                                                👁️{playlist.profiles.length} perfiles - {playlist.videos.length} videos
                                            </span>
                                        </span>
                                        <div>
                                            <button className="btn btn-sm btn-info me-2" onClick={() => navigate(`/update_playlist/${playlist._id}`)}>
                                                ✏️ Editar
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDeletePlaylist(playlist._id)}>
                                                🗑️ Borrar
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        🎵 Crear Playlist
                    </button>
                </div>
            </div>

            {/* Modal para crear playlist */}
            <Modal show={showModal} onHide={() => { setShowModal(false); setSelectedProfiles([]); }}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Nueva Playlist</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && (
                        <div className="alert alert-danger" role="alert">
                            {errorMessage}
                        </div>
                    )}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre de la Playlist</Form.Label>
                            <Form.Control
                                type="text"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Seleccionar Perfiles</Form.Label>
                            {profiles.map((profile) => (
                                <Form.Check
                                    key={profile._id}
                                    label={profile.fullName}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedProfiles((prev) => [...new Set([...prev, profile._id])]);
                                        } else {
                                            setSelectedProfiles(selectedProfiles.filter((id) => id !== profile._id));
                                        }
                                    }}
                                />
                            ))}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleCreatePlaylist}>Guardar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}