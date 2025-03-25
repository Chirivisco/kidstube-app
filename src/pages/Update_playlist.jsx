import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Update_playlist.css";
import { Button, Form, Modal } from "react-bootstrap";

export default function UpdatePlaylist() {
    const [playlist, setPlaylist] = useState(null);
    const [newVideo, setNewVideo] = useState({ name: "", url: "", description: "" });
    const [showModal, setShowModal] = useState(false);
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchPlaylistData = async () => {
            const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setPlaylist(await response.json());
            } else {
                console.error("Error al obtener la playlist");
            }
        };

        fetchPlaylistData();
    }, [playlistId, token]);

    const handleAddVideo = async () => {
        if (!newVideo.name || !newVideo.url || !newVideo.description) {
            alert("Por favor, completa todos los campos del video.");
            return;
        }

        const updatedPlaylist = { ...playlist, videos: [...playlist.videos, newVideo] };

        try {
            const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedPlaylist),
            });

            if (response.ok) {
                setPlaylist(updatedPlaylist);
                setNewVideo({ name: "", url: "", description: "" });
            } else {
                console.error("Error al agregar video");
            }
        } catch (error) {
            console.error("Error de conexión al agregar video", error);
        }
    };

    const handleDeleteVideo = async (videoIndex) => {
        const updatedPlaylist = { ...playlist };
        updatedPlaylist.videos.splice(videoIndex, 1);

        try {
            const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedPlaylist),
            });

            if (response.ok) {
                setPlaylist(updatedPlaylist);
            } else {
                console.error("Error al eliminar video");
            }
        } catch (error) {
            console.error("Error de conexión al eliminar video", error);
        }
    };

    const handleSaveChanges = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(playlist),
            });

            if (response.ok) {
                alert("Playlist actualizada correctamente.");
            } else {
                console.error("Error al guardar cambios");
            }
        } catch (error) {
            console.error("Error de conexión al guardar cambios", error);
        }
    };

    if (!playlist) return <div>Cargando...</div>;

    return (
        <div className="container mt-4">
            <h2>Editar Playlist: {playlist.name}</h2>
            <Button className="mb-3" onClick={handleSaveChanges}>Guardar Cambios</Button>
            <div className="card">
                <div className="card-header">Videos</div>
                <div className="card-body">
                    <ul className="list-group">
                        {playlist.videos.map((video, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{video.name}</strong> - {video.url}
                                    <p>{video.description}</p>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteVideo(index)}>
                                    🗑️ Borrar
                                </button>
                            </li>
                        ))}
                    </ul>
                    <Button className="mt-3" onClick={() => setShowModal(true)}>Agregar Video</Button>
                </div>
            </div>

            {/* Modal para agregar video */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Agregar Nuevo Video</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre del Video</Form.Label>
                            <Form.Control
                                type="text"
                                value={newVideo.name}
                                onChange={(e) => setNewVideo({ ...newVideo, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>URL de YouTube</Form.Label>
                            <Form.Control
                                type="url"
                                value={newVideo.url}
                                onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                type="text"
                                value={newVideo.description}
                                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleAddVideo}>Agregar Video</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
