import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Card, Accordion, Toast, ToastContainer, Row, Col } from "react-bootstrap";
import "../css/Update_playlist.css";

const UpdatePlaylist = () => {
    const { playlistId } = useParams(); // Obtiene el ID de la playlist desde la URL
    const navigate = useNavigate(); // Hook para navegar entre rutas

    // Estados para manejar los datos de la playlist, videos, perfiles y notificaciones
    const [playlist, setPlaylist] = useState(null); // Datos de la playlist actual
    const [playlistName, setPlaylistName] = useState(""); // Nombre de la playlist
    const [videos, setVideos] = useState([]); // Lista de videos en la playlist
    const [newVideo, setNewVideo] = useState({ name: "", url: "", description: "" }); // Datos del video a agregar o editar
    const [editingVideoId, setEditingVideoId] = useState(null); // ID del video que se está editando
    const [selectedProfiles, setSelectedProfiles] = useState([]); // IDs de los perfiles asociados a la playlist
    const [allProfiles, setAllProfiles] = useState([]); // Lista de todos los perfiles disponibles
    const [showToast, setShowToast] = useState(false); // Controla la visibilidad del Toast
    const [toastMessage, setToastMessage] = useState(""); // Mensaje a mostrar en el Toast

    // Efecto para cargar los datos de la playlist y los perfiles al montar el componente
    useEffect(() => {
        const fetchPlaylist = async () => {
            const token = localStorage.getItem("token");
            const tokenProfile = localStorage.getItem("token_profile");
            try {
                const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                    headers: { Authorization: `Bearer ${tokenProfile}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log("Playlist cargada:", data); // Log para verificar los datos de la playlist
                    setPlaylist(data);
                    setPlaylistName(data.name);
                    setVideos(data.videos);
                    setSelectedProfiles(data.profiles.map((profile) => profile._id)); // Inicializa los perfiles seleccionados
                } else {
                    console.error("Error al obtener la playlist:", response.statusText);
                }
            } catch (error) {
                console.error("Error al obtener la playlist", error);
            }
        };

        const fetchProfiles = async () => {
            const token = localStorage.getItem("token");
            const tokenProfile = localStorage.getItem("token_profile");
            const user = JSON.parse(localStorage.getItem("user")); // Obtiene el usuario desde el Local Storage
            const userId = user?.id;

            if (!userId) {
                console.error("No se encontró el ID del usuario.");
                return;
            }

            try {
                const response = await fetch(`http://localhost:3001/profiles/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const profiles = await response.json();
                    console.log("Perfiles cargados:", profiles); // Log para verificar los perfiles cargados
                    setAllProfiles(profiles);
                } else {
                    console.error("Error al obtener los perfiles:", response.statusText);
                }
            } catch (error) {
                console.error("Error al obtener los perfiles", error);
            }
        };

        fetchPlaylist(); // Carga los datos de la playlist
        fetchProfiles(); // Carga los perfiles disponibles
    }, [playlistId]);

    // Efecto para actualizar los perfiles seleccionados cuando se cargan los datos de la playlist o los perfiles
    useEffect(() => {
        if (playlist && allProfiles.length > 0) {
            const profileIds = playlist.profiles; // IDs de los perfiles asociados a la playlist
            setSelectedProfiles(profileIds); // Establece los perfiles seleccionados
        }
    }, [playlist, allProfiles]);

    // Actualiza el nombre de la playlist en el servidor
    const handleUpdatePlaylist = async () => {
        const tokenProfile = localStorage.getItem("token_profile");
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenProfile}`,
                },
                body: JSON.stringify({ name: playlistName }),
            });

            if (response.ok) {
                setToastMessage("Playlist actualizada con éxito.");
                setShowToast(true);
            }
        } catch (error) {
            console.error("Error al actualizar la playlist", error);
        }
    };

    // Agrega o actualiza un video en la playlist
    const handleAddOrUpdateVideo = async () => {
        if (!newVideo.name.trim() || !newVideo.url.trim() || !newVideo.description.trim()) {
            setToastMessage("Todos los campos son obligatorios.");
            setShowToast(true);
            return;
        }

        const token = localStorage.getItem("token");
        const tokenProfile = localStorage.getItem("token_profile");

        if (editingVideoId) {
            // Actualiza un video existente
            try {
                const response = await fetch(`http://localhost:3001/api/videos/${editingVideoId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokenProfile}`,
                    },
                    body: JSON.stringify(newVideo),
                });

                if (response.ok) {
                    const updatedVideo = await response.json();
                    setVideos(videos.map((video) => (video._id === editingVideoId ? updatedVideo : video)));
                    setNewVideo({ name: "", url: "", description: "" });
                    setEditingVideoId(null);
                    setToastMessage("Video actualizado con éxito.");
                    setShowToast(true);
                }
            } catch (error) {
                console.error("Error al actualizar el video", error);
            }
        } else {
            // Agrega un nuevo video
            try {
                const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}/videos`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokenProfile}`,
                    },
                    body: JSON.stringify(newVideo),
                });

                if (response.ok) {
                    const videoAdded = await response.json();
                    setVideos([...videos, videoAdded]);
                    setNewVideo({ name: "", url: "", description: "" });
                    setToastMessage("Video agregado con éxito.");
                    setShowToast(true);
                }
            } catch (error) {
                console.error("Error al agregar el video", error);
            }
        }
    };

    // Actualiza los perfiles asociados a la playlist en el servidor
    const handleUpdateProfiles = async () => {
        const token = localStorage.getItem("token");
        const tokenProfile = localStorage.getItem("token_profile");
        try {
            const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenProfile}`,
                },
                body: JSON.stringify({ profiles: selectedProfiles }),
            });

            if (response.ok) {
                setToastMessage("Perfiles actualizados con éxito.");
                setShowToast(true);
            }
        } catch (error) {
            console.error("Error al actualizar los perfiles", error);
        }
    };

    // Carga los datos de un video en el formulario para editarlo
    const handleEditVideo = (video) => {
        setNewVideo({ name: video.name, url: video.url, description: video.description });
        setEditingVideoId(video._id);
    };

    // Elimina un video de la playlist
    const handleDeleteVideo = async (videoId) => {
        const token = localStorage.getItem("token");
        const tokenProfile = localStorage.getItem("token_profile");
        try {
            const response = await fetch(`http://localhost:3001/api/videos/${videoId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${tokenProfile}` },
            });

            if (response.ok) {
                setVideos(videos.filter((video) => video._id !== videoId));
                setToastMessage("Video eliminado.");
                setShowToast(true);
            }
        } catch (error) {
            console.error("Error al eliminar el video", error);
        }
    };

    return (
        <div className="update-playlist-container">
            <h2 className="update-title">Editar Playlist</h2>

            {/* Botón para regresar */}
            <Button variant="secondary" onClick={() => navigate("/main-dashboard")} className="mb-3">
                Regresar al Dashboard
            </Button>

            {/* Notificación Toast */}
            <ToastContainer position="top-end" className="p-3">
                <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Formulario para editar el nombre de la playlist */}
            <Card className="update-card">
                <Card.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre de la Playlist</Form.Label>
                            <Form.Control
                                type="text"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="primary" onClick={handleUpdatePlaylist}>Guardar Cambios</Button>
                    </Form>
                </Card.Body>
            </Card>

            {/* Formulario para editar los perfiles asociados */}
            <h3 className="profiles-title">Perfiles Asociados</h3>
            <Card className="profiles-card">
                <Card.Body>
                    <Form>
                        {allProfiles.map((profile) => (
                            <Form.Check
                                key={profile._id}
                                type="checkbox"
                                label={profile.fullName}
                                checked={selectedProfiles.includes(profile._id)} // Comparar solo por el ID
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        // Agregar el perfil a la lista de seleccionados
                                        setSelectedProfiles((prev) => [...prev, profile._id]);
                                    } else {
                                        // Eliminar el perfil de la lista de seleccionados
                                        setSelectedProfiles((prev) => prev.filter((id) => id !== profile._id));
                                    }
                                }}
                            />
                        ))}

                        <Button variant="primary" onClick={handleUpdateProfiles} className="mt-3">
                            Guardar Perfiles
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {/* Lista de videos en la playlist */}
            <h3 className="videos-title">Videos en la Playlist</h3>
            <Accordion>
                {videos.map((video, index) => (
                    <Accordion.Item eventKey={index.toString()} key={video._id}>
                        <Accordion.Header>{video.name}</Accordion.Header>
                        <Accordion.Body>
                            <p><strong>URL:</strong> <a href={video.url} target="_blank" rel="noopener noreferrer">{video.url}</a></p>
                            <p><strong>Descripción:</strong> {video.description}</p>
                            <Button variant="info" size="sm" onClick={() => handleEditVideo(video)}>Editar</Button>{' '}
                            <Button variant="danger" size="sm" onClick={() => handleDeleteVideo(video._id)}>Eliminar</Button>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>

            {/* Formulario para agregar o editar un video */}
            <h3 className="add-video-title">{editingVideoId ? "Editar Video" : "Agregar Nuevo Video"}</h3>
            <Card className="add-video-card">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre del Video</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nombre del video"
                                    value={newVideo.name}
                                    onChange={(e) => setNewVideo({ ...newVideo, name: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>URL de YouTube</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={newVideo.url}
                                    onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Breve descripción"
                                    value={newVideo.description}
                                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button variant="success" onClick={handleAddOrUpdateVideo}>
                        {editingVideoId ? "Guardar Cambios" : "Agregar Video"}
                    </Button>
                </Card.Body>
            </Card>
        </div>
    );
};

export default UpdatePlaylist;