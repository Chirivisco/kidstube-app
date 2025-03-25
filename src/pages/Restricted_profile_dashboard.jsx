import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import "../css/Restricted_profile_dashboard.css";

const RestrictedProfileDashboard = ({ profileId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get(`/playlists/profile/${profileId}`);
        setPlaylists(response.data);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };
    fetchPlaylists();
  }, [profileId]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        let allVideos = [];
        for (const playlist of playlists) {
          const response = await axios.get(`/playlists/${playlist._id}/videos`);
          allVideos = [...allVideos, ...response.data];
        }
        setVideos(allVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
    if (playlists.length) fetchVideos();
  }, [playlists]);

  const filteredVideos = videos.filter(
    (video) =>
      video.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container className="dashboard-container">
      <h2 className="dashboard-title">Mis Playlists</h2>
      <Row>
        {playlists.map((playlist) => (
          <Col key={playlist._id} md={4}>
            <Card className="playlist-card">
              <Card.Body>
                <Card.Title>{playlist.name}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <h2 className="dashboard-title">Videos</h2>
      <InputGroup className="mb-3 search-bar">
        <Form.Control
          type="text"
          placeholder="Buscar videos por nombre o URL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>
      <Row>
        {filteredVideos.map((video) => (
          <Col key={video._id} md={4}>
            <Card className="video-card">
              <Card.Body>
                <Card.Title>{video.name}</Card.Title>
                <a href={video.url} target="_blank" rel="noopener noreferrer">
                  Ver Video
                </a>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default RestrictedProfileDashboard;
