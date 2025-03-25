import React, { useState, useEffect } from "react";
import { Navbar, Nav, NavDropdown, Container, Row, Col, Card, ListGroup, Form, FormControl, Modal, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router";
import "../css/Restricted_profile_dashboard.css";

const RestrictedProfileDashboard = () => {
    // Estado para almacenar el perfil seleccionado
    const [selectedProfile, setSelectedProfile] = useState(() => {
        const storedProfile = localStorage.getItem("selectedProfile");
        return storedProfile ? JSON.parse(storedProfile) : null;
    });

    // Estado para almacenar las playlists asociadas al perfil
    const [playlists, setPlaylists] = useState([]);

    // Estado para almacenar los videos de la playlist seleccionada
    const [videos, setVideos] = useState([]);

    // Estado para manejar el término de búsqueda de videos
    const [searchTerm, setSearchTerm] = useState("");

    // Estado para almacenar el nombre de la playlist seleccionada
    const [selectedPlaylistName, setSelectedPlaylistName] = useState("");

    // Estado para controlar la visibilidad del modal
    const [showModal, setShowModal] = useState(false);

    // Estado para almacenar la URL del video seleccionado
    const [videoUrl, setVideoUrl] = useState("");

    // Hook para manejar la navegación entre rutas
    const navigate = useNavigate();

    /**
     * Maneja la salida del perfil seleccionado.
     * Elimina el perfil del localStorage y redirige al selector de perfiles.
     */
    const handleExitProfile = () => {
        localStorage.removeItem("selectedProfile");
        navigate("/profile-select");
    };

    /**
     * Maneja el cierre de sesión del usuario.
     * Elimina el token, el usuario y el perfil seleccionado del localStorage y redirige a la página de inicio.
     */
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("selectedProfile");
        navigate("/");
    };

    /**
     * Efecto para cargar las playlists cuando se selecciona un perfil.
     */
    useEffect(() => {
        if (selectedProfile) {
            fetchPlaylists();
        }
    }, [selectedProfile]);

    /**
     * Obtiene las playlists asociadas al perfil seleccionado desde el backend.
     */
    const fetchPlaylists = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const response = await axios.get(`http://localhost:3001/api/playlists/profile/${selectedProfile._id}`, config);
            setPlaylists(response.data);
        } catch (error) {
            console.error("Error al obtener las playlists", error);
        }
    };

    /**
     * Obtiene los videos de una playlist específica desde el backend.
     * @param {string} playlistId - ID de la playlist seleccionada.
     * @param {string} playlistName - Nombre de la playlist seleccionada.
     */
    const fetchVideos = async (playlistId, playlistName) => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const response = await axios.get(`http://localhost:3001/api/playlists/${playlistId}/videos`, config);
            setVideos(response.data);
            setSelectedPlaylistName(playlistName); // Actualiza el nombre de la playlist seleccionada
        } catch (error) {
            console.error("Error al obtener los videos", error);
        }
    };

    /**
     * Filtra los videos según el término de búsqueda ingresado.
     */
    const filteredVideos = videos.filter(video =>
        video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /**
     * Abre el modal para reproducir un video.
     * @param {string} url - URL del video seleccionado.
     */
    const openVideoModal = (url) => {
        // Verifica si la URL es en formato "youtu.be"
        const videoId = url.includes("youtu.be")
            ? url.split("/")[3].split("?")[0] // Extrae el ID del video
            : url.split("v=")[1].split("&")[0]; // Extrae el ID si ya es una URL de YouTube
    
        // Crea la URL en formato de incrustación
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        
        setVideoUrl(embedUrl); // Establece la URL para el iframe
        setShowModal(true); // Muestra el modal
    };

    /**
     * Cierra el modal de reproducción de video.
     */
    const closeModal = () => {
        setShowModal(false); // Cierra el modal
        setVideoUrl(""); // Resetea la URL del video
    };

    return (
        <div className="dashboard-container">
            {/* Barra de navegación */}
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

            {/* Contenido principal */}
            <Container fluid>
                <Row>
                    {/* Columna de playlists */}
                    <Col md={4} className="playlists-column">
                        <Card className="playlist-card shadow-sm">
                            <Card.Header className="playlist-header">🎵 Tus Playlists</Card.Header>
                            <ListGroup variant="flush" className="playlist-list">
                                {playlists.map(playlist => (
                                    <ListGroup.Item
                                        key={playlist._id}
                                        className={`playlist-item ${selectedPlaylistName === playlist.name ? "active-playlist" : ""}`}
                                        onClick={() => fetchVideos(playlist._id, playlist.name)}
                                    >
                                        {playlist.name}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    </Col>

                    {/* Columna de videos */}
                    <Col md={8} className="videos-column">
                        <Card className="video-card shadow-sm">
                            <Card.Header className="video-header">
                                🎬 Videos {selectedPlaylistName && `de "${selectedPlaylistName}"`}
                            </Card.Header>
                            <Form className="search-bar">
                                <FormControl
                                    type="text"
                                    placeholder="Buscar videos..."
                                    className="search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Form>
                            <ListGroup variant="flush" className="video-list">
                                {filteredVideos.length > 0 ? (
                                    filteredVideos.map(video => (
                                        <ListGroup.Item key={video._id} className="video-item">
                                            <strong>{video.name}</strong> - <Button variant="link" onClick={() => openVideoModal(video.url)}>Ver</Button>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <p className="text-center no-videos">No hay videos disponibles.</p>
                                )}
                            </ListGroup>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal para reproducir el video */}
            <Modal show={showModal} onHide={closeModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Reproducir Video</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="embed-container">
                        <iframe
                            width="100%"
                            height="400"
                            src={videoUrl}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RestrictedProfileDashboard;