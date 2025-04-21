import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import "../css/Update_playlist.css";

const UpdatePlaylist = () => {
    const { playlistId } = useParams();
    const navigate = useNavigate();

    const [playlist, setPlaylist] = useState(null);
    const [playlistName, setPlaylistName] = useState("");
    const [videos, setVideos] = useState([]);
    const [newVideo, setNewVideo] = useState({ name: "", url: "", description: "" });
    const [editingVideoId, setEditingVideoId] = useState(null);
    const [selectedProfiles, setSelectedProfiles] = useState([]);
    const [allProfiles, setAllProfiles] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        const fetchPlaylist = async () => {
            const tokenProfile = localStorage.getItem("token_profile");
            try {
                const response = await fetch(`http://localhost:3001/api/playlists/${playlistId}`, {
                    headers: { Authorization: `Bearer ${tokenProfile}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setPlaylist(data);
                    setPlaylistName(data.name);
                    setVideos(data.videos);
                    setSelectedProfiles(data.profiles.map((profile) => profile._id));
                }
            } catch (error) {
                console.error("Error al obtener la playlist", error);
            }
        };

        const fetchProfiles = async () => {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?.id;

            if (!userId) return;

            try {
                const response = await fetch(`http://localhost:3001/profiles/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const profiles = await response.json();
                    setAllProfiles(profiles);
                }
            } catch (error) {
                console.error("Error al obtener los perfiles", error);
            }
        };

        fetchPlaylist();
        fetchProfiles();
    }, [playlistId]);

    useEffect(() => {
        if (playlist && allProfiles.length > 0) {
            setSelectedProfiles(playlist.profiles);
        }
    }, [playlist, allProfiles]);

    const handleUpdatePlaylist = async () => {
        const tokenProfile = localStorage.getItem("token_profile");
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
                setToastMessage("Playlist actualizada con éxito");
                setShowToast(true);
            }
        } catch (error) {
            console.error("Error al actualizar la playlist", error);
        }
    };

    const handleAddOrUpdateVideo = async () => {
        if (!newVideo.name.trim() || !newVideo.url.trim() || !newVideo.description.trim()) {
            setToastMessage("Todos los campos son obligatorios");
            setShowToast(true);
            return;
        }

        const tokenProfile = localStorage.getItem("token_profile");

        if (editingVideoId) {
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
                    setToastMessage("Video actualizado con éxito");
                    setShowToast(true);
                }
            } catch (error) {
                console.error("Error al actualizar el video", error);
            }
        } else {
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
                    setToastMessage("Video agregado con éxito");
                    setShowToast(true);
                }
            } catch (error) {
                console.error("Error al agregar el video", error);
            }
        }
    };

    const handleUpdateProfiles = async () => {
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
                setToastMessage("Perfiles actualizados con éxito");
                setShowToast(true);
            }
        } catch (error) {
            console.error("Error al actualizar los perfiles", error);
        }
    };

    const handleEditVideo = (video) => {
        setNewVideo({ name: video.name, url: video.url, description: video.description });
        setEditingVideoId(video._id);
    };

    const handleDeleteVideo = async (videoId) => {
        const tokenProfile = localStorage.getItem("token_profile");
        try {
            const response = await fetch(`http://localhost:3001/api/videos/${videoId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${tokenProfile}` },
            });

            if (response.ok) {
                setVideos(videos.filter((video) => video._id !== videoId));
                setToastMessage("Video eliminado con éxito");
                setShowToast(true);
            }
        } catch (error) {
            console.error("Error al eliminar el video", error);
        }
    };

    return (
        <div className="update-playlist-container">
            <div className="playlist-header">
                <h1 className="playlist-title">{playlistName}</h1>
                <div className="playlist-actions">
                    <button className="save-button" onClick={handleUpdatePlaylist}>
                        Guardar Cambios
                    </button>
                    <button className="cancel-button" onClick={() => navigate("/main-dashboard")}>
                        Cancelar
                    </button>
                </div>
            </div>

            <div className="section-container">
                <h2 className="section-title">Editar Nombre de la Playlist</h2>
                <Form.Group className="form-group">
                    <Form.Label>Nombre de la Playlist</Form.Label>
                    <Form.Control
                        type="text"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                    />
                </Form.Group>
            </div>

            <div className="section-container">
                <h2 className="section-title">Agregar Nuevo Video</h2>
                <div className="video-form">
                    <Form.Group className="form-group">
                        <Form.Label>Nombre del Video</Form.Label>
                        <Form.Control
                            type="text"
                            value={newVideo.name}
                            onChange={(e) => setNewVideo({ ...newVideo, name: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="form-group">
                        <Form.Label>URL del Video</Form.Label>
                        <Form.Control
                            type="text"
                            value={newVideo.url}
                            onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="form-group">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            value={newVideo.description}
                            onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                        />
                    </Form.Group>
                    <button
                        className="save-button"
                        onClick={handleAddOrUpdateVideo}
                    >
                        {editingVideoId ? "Actualizar Video" : "Agregar Video"}
                    </button>
                </div>
            </div>

            <div className="section-container">
                <h2 className="section-title">Videos en la Playlist</h2>
                <div className="video-list">
                    {videos.map((video) => (
                        <div key={video._id} className="video-card">
                            <div className="video-info">
                                <h3 className="video-title">{video.name}</h3>
                                <p className="video-description">{video.description}</p>
                            </div>
                            <div className="video-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => handleEditVideo(video)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDeleteVideo(video._id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="section-container">
                <h2 className="section-title">Perfiles Asociados</h2>
                <div className="profiles-section">
                    {allProfiles.map((profile) => (
                        <div key={profile._id} className="profile-checkbox">
                            <input
                                type="checkbox"
                                id={profile._id}
                                checked={selectedProfiles.includes(profile._id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedProfiles([...selectedProfiles, profile._id]);
                                    } else {
                                        setSelectedProfiles(selectedProfiles.filter(id => id !== profile._id));
                                    }
                                }}
                            />
                            <label htmlFor={profile._id}>{profile.fullName}</label>
                        </div>
                    ))}
                </div>
                <button
                    className="save-button"
                    onClick={handleUpdateProfiles}
                >
                    Actualizar Perfiles
                </button>
            </div>

            {showToast && (
                <div className="toast-container">
                    <div className={`toast ${toastMessage.includes("éxito") ? "success" : "error"}`}>
                        {toastMessage}
                        <button onClick={() => setShowToast(false)}>×</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdatePlaylist;