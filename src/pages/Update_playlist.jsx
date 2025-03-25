import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Card, Accordion, Toast, ToastContainer, Row, Col } from "react-bootstrap";
import "../css/Update_playlist.css";

const UpdatePlaylist = () => {
    const { playlistId } = useParams();
    const navigate = useNavigate();

    const [playlist, setPlaylist] = useState(null);
    const [playlistName, setPlaylistName] = useState("");
    const [videos, setVideos] = useState([]);
    const [newVideo, setNewVideo] = useState({ name: "", url: "", description: "" });
    const [editingVideoId, setEditingVideoId] = useState(null); // Nuevo estado para el ID del video en edición
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        const fetchPlaylist = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setPlaylist(data);
                    setPlaylistName(data.name);
                    setVideos(data.videos);
                }
            } catch (error) {
                console.error("Error al obtener la playlist", error);
            }
        };

        fetchPlaylist();
    }, [playlistId]);

    const handleUpdatePlaylist = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
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

    const handleAddOrUpdateVideo = async () => {
        if (!newVideo.name.trim() || !newVideo.url.trim() || !newVideo.description.trim()) {
            setToastMessage("Todos los campos son obligatorios.");
            setShowToast(true);
            return;
        }

        const token = localStorage.getItem("token");

        if (editingVideoId) {
            // Actualizar un video existente
            try {
                const response = await fetch(`http://localhost:3001/api/videos/${editingVideoId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
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
            // Agregar un nuevo video
            try {
                const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}/videos`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
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

    const handleEditVideo = (video) => {
        setNewVideo({ name: video.name, url: video.url, description: video.description });
        setEditingVideoId(video._id);
    };

    const handleDeleteVideo = async (videoId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:3001/api/videos/${videoId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
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

            {/* Notificación Toast */}
            <ToastContainer position="top-end" className="p-3">
                <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>

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