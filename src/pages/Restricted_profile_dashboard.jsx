import React, { useState, useEffect } from "react";
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Card,
    CardContent,
    TextField,
    Grid,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    Paper,
    Container,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    PlaylistPlay as PlaylistIcon,
    VideoLibrary as VideoIcon,
    ExitToApp as LogoutIcon,
    Person as PersonIcon,
    Search as SearchIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import "../css/Restricted_profile_dashboard.css";

const drawerWidth = 280;

const RestrictedProfileDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(() => {
        const storedProfile = localStorage.getItem("selectedProfile");
        return storedProfile ? JSON.parse(storedProfile) : null;
    });
    const [playlists, setPlaylists] = useState([]);
    const [videos, setVideos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPlaylistName, setSelectedPlaylistName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleExitProfile = () => {
        localStorage.removeItem("selectedProfile");
        navigate("/profile-select");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("selectedProfile");
        navigate("/");
    };

    useEffect(() => {
        if (selectedProfile) {
            fetchPlaylists();
        }
    }, [selectedProfile]);

    const fetchPlaylists = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: `
                        query GetProfile($profileId: ID!) {
                            profile(id: $profileId) {
                                id
                                playlists {
                                    id
                                    name
                                    description
                                    videos {
                                        id
                                        name
                                        url
                                    }
                                }
                            }
                        }
                    `,
                    variables: {
                        profileId: selectedProfile.id
                    }
                })
            });

            const result = await response.json();
            if (result.data && result.data.profile) {
                setPlaylists(result.data.profile.playlists);
            }
        } catch (error) {
            console.error("Error al obtener las playlists", error);
        }
    };

    const fetchVideos = async (playlistId, playlistName) => {
        if (!playlistId) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: `
                        query GetPlaylist($id: ID!) {
                            playlist(id: $id) {
                                id
                                name
                                videos {
                                    id
                                    name
                                    url
                                }
                            }
                        }
                    `,
                    variables: {
                        id: playlistId
                    }
                })
            });

            const result = await response.json();
            if (result.data && result.data.playlist) {
                setVideos(result.data.playlist.videos);
                setSelectedPlaylistName(playlistName);
            }
        } catch (error) {
            console.error("Error al obtener los videos", error);
        }
    };

    const filteredVideos = videos.filter(video =>
        video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openVideoModal = (url) => {
        let videoId;
        if (url.includes("youtu.be")) {
            videoId = url.split("/")[3].split("?")[0];
        } else if (url.includes("youtube.com")) {
            videoId = url.split("v=")[1].split("&")[0];
        } else {
            videoId = url;
        }
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        setVideoUrl(embedUrl);
        setShowModal(true);
    };

    const drawer = (
        <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
                <Typography variant="h6" noWrap component="div">
                    KidsTube
                </Typography>
                {isMobile && (
                    <IconButton onClick={handleDrawerToggle}>
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Toolbar>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {selectedProfile?.fullName?.charAt(0)}
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" noWrap>
                        {selectedProfile?.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Perfil Restringido
                    </Typography>
                </Box>
            </Box>
            <Divider />
            <List>
                <ListItem button onClick={() => setMobileOpen(false)}>
                    <ListItemIcon>
                        <PlaylistIcon />
                    </ListItemIcon>
                    <ListItemText primary="Playlists" />
                </ListItem>
                <ListItem button onClick={() => setMobileOpen(false)}>
                    <ListItemIcon>
                        <VideoIcon />
                    </ListItemIcon>
                    <ListItemText primary="Videos" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {selectedPlaylistName ? `Playlist: ${selectedPlaylistName}` : 'Dashboard'}
                    </Typography>
                    <IconButton
                        onClick={handleMenuOpen}
                        size="large"
                        edge="end"
                        color="inherit"
                    >
                        <PersonIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleExitProfile}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Salir del Perfil</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Cerrar Sesión</ListItemText>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant={isMobile ? "temporary" : "permanent"}
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: '64px'
                }}
            >
                <Container maxWidth="xl">
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 2,
                                    height: 'calc(100vh - 100px)',
                                    overflow: 'auto'
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    Playlists
                                </Typography>
                                <List>
                                    {playlists.map((playlist) => (
                                        <ListItem
                                            key={playlist.id}
                                            button
                                            selected={selectedPlaylistName === playlist.name}
                                            onClick={() => fetchVideos(playlist.id, playlist.name)}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 1,
                                                '&.Mui-selected': {
                                                    bgcolor: 'primary.main',
                                                    color: 'primary.contrastText',
                                                    '&:hover': {
                                                        bgcolor: 'primary.dark',
                                                    },
                                                },
                                            }}
                                        >
                                            <ListItemIcon sx={{ color: 'inherit' }}>
                                                <PlaylistIcon />
                                            </ListItemIcon>
                                            <ListItemText primary={playlist.name} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 2,
                                    height: 'calc(100vh - 100px)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Buscar videos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                    />
                                </Box>

                                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                    {filteredVideos.length > 0 ? (
                                        <Grid container spacing={2}>
                                            {filteredVideos.map((video) => (
                                                <Grid item xs={12} sm={6} md={4} key={video.id}>
                                                    <Card
                                                        sx={{
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            transition: 'transform 0.2s',
                                                            '&:hover': {
                                                                transform: 'scale(1.02)',
                                                                cursor: 'pointer'
                                                            }
                                                        }}
                                                        onClick={() => openVideoModal(video.url)}
                                                    >
                                                        <CardContent>
                                                            <Typography variant="h6" noWrap>
                                                                {video.name}
                                                            </Typography>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                fullWidth
                                                                sx={{ mt: 1 }}
                                                            >
                                                                Ver Video
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%'
                                            }}
                                        >
                                            <Typography variant="h6" color="text.secondary">
                                                No hay videos disponibles
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Dialog
                open={showModal}
                onClose={() => setShowModal(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        overflow: 'hidden',
                        height: 'auto'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2
                }}>
                    <Typography variant="h6">Reproducir Video</Typography>
                    <IconButton 
                        onClick={() => setShowModal(false)}
                        sx={{ color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, height: 'auto' }}>
                    <Box sx={{
                        width: '100%',
                        height: '500px',
                        bgcolor: 'black',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <iframe
                            width="100%"
                            height="100%"
                            src={videoUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{
                                border: 'none',
                                display: 'block'
                            }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default RestrictedProfileDashboard;