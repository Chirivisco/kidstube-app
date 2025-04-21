import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/NewPlaylistDashboard.css";

const NewPlaylistDashboard = () => {
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
    const [activeTab, setActiveTab] = useState("videos");

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
                    if (data.profiles && Array.isArray(data.profiles)) {
                        setSelectedProfiles(data.profiles);
                    }
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
        <div id="new-playlist-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <input
                        type="text"
                        className="playlist-name-input"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        placeholder="Nombre de la playlist"
                    />
                    <div className="header-actions">
                        <button className="save-btn" onClick={handleUpdatePlaylist}>
                            Guardar
                        </button>
                        <button className="cancel-btn" onClick={() => navigate("/main-dashboard")}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "videos" ? "active" : ""}`}
                        onClick={() => setActiveTab("videos")}
                    >
                        Videos
                    </button>
                    <button
                        className={`tab ${activeTab === "profiles" ? "active" : ""}`}
                        onClick={() => setActiveTab("profiles")}
                    >
                        Perfiles
                    </button>
                </div>

                {activeTab === "videos" && (
                    <div className="videos-section">
                        <div className="add-video-form">
                            <h3>Agregar Nuevo Video</h3>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Nombre del video"
                                    value={!editingVideoId ? newVideo.name : ""}
                                    onChange={(e) => setNewVideo({ ...newVideo, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="URL del video"
                                    value={!editingVideoId ? newVideo.url : ""}
                                    onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <textarea
                                    placeholder="Descripción"
                                    value={!editingVideoId ? newVideo.description : ""}
                                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                                />
                            </div>
                            <button className="submit-btn" onClick={handleAddOrUpdateVideo}>
                                Agregar
                            </button>
                        </div>

                        {editingVideoId && (
                            <div className="edit-video-form">
                                <h3>Editar Video</h3>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Nombre del video"
                                        value={newVideo.name}
                                        onChange={(e) => setNewVideo({ ...newVideo, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="URL del video"
                                        value={newVideo.url}
                                        onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <textarea
                                        placeholder="Descripción"
                                        value={newVideo.description}
                                        onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                                    />
                                </div>
                                <div className="edit-form-actions">
                                    <button className="submit-btn" onClick={handleAddOrUpdateVideo}>
                                        Actualizar
                                    </button>
                                    <button 
                                        className="cancel-edit-btn"
                                        onClick={() => {
                                            setEditingVideoId(null);
                                            setNewVideo({ name: "", url: "", description: "" });
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="videos-list">
                            {videos.map((video) => (
                                <div key={video._id} className="video-card">
                                    <div className="video-info">
                                        <h4>{video.name}</h4>
                                        <p>{video.description}</p>
                                    </div>
                                    <div className="video-actions">
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEditVideo(video)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteVideo(video._id)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "profiles" && (
                    <div className="profiles-section">
                        <div className="profiles-list">
                            {allProfiles.map((profile) => (
                                <div key={profile._id} className="profile-item">
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
                        <button className="save-profiles-btn" onClick={handleUpdateProfiles}>
                            Guardar Perfiles
                        </button>
                    </div>
                )}
            </div>

            {showToast && (
                <div className="toast">
                    <div className={`toast-content ${toastMessage.includes("éxito") ? "success" : "error"}`}>
                        {toastMessage}
                        <button onClick={() => setShowToast(false)}>×</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewPlaylistDashboard; 