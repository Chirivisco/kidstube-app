import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from "./pages/LoginSignUp.js";
import ProfileSelec from "./pages/Profile_selec.jsx";
import MainProfileDashboard from "./pages/Main_profile_dashboard";
import Profile_data from "./pages/Profile_data";
import Update_playlist from "./pages/Update_playlist.jsx";
import RestrictedProfileDashboard from "./pages/Restricted_profile_dashboard.jsx";
import ProtectedRoute from "./Middleware/ProtectedRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/profile-select" element={<ProfileSelec />} />
        {/* Protege la ruta del dashboard principal para que solo los perfiles con rol "main" puedan acceder */}
        <Route
          path="/main-dashboard"
          element={
            <ProtectedRoute allowedRoles={["main"]}>
              <MainProfileDashboard />
            </ProtectedRoute>
          }
        />
        {/* Protege la ruta /profile_data para que solo los perfiles con rol "main" puedan acceder */}
        <Route
          path="/profile_data"
          element={
            <ProtectedRoute allowedRoles={["main"]}>
              <Profile_data />
            </ProtectedRoute>
          }
        />
        {/* Protege la ruta /update_playlist/:playlistId para que solo los perfiles con rol "main" puedan acceder */}
        <Route
          path="/update_playlist/:playlistId"
          element={
            <ProtectedRoute allowedRoles={["main"]}>
              <Update_playlist />
            </ProtectedRoute>
          }
        />
        {/* Protege la ruta del dashboard restringido para que solo los perfiles con rol "restricted" puedan acceder */}
        <Route
          path="/restricted-dashboard/:profileId"
          element={
            <ProtectedRoute allowedRoles={["restricted"]}>
              <RestrictedProfileDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;