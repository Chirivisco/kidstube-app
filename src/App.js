import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from "./pages/LoginSignUp.js";
import ProfileSelec from "./pages/Profile_selec.jsx";
import MainProfileDashboard from "./pages/Main_profile_dashboard";
import Profile_data from "./pages/Profile_data";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/profile-select" element={<ProfileSelec />} />
        <Route path="/main-dashboard" element={<MainProfileDashboard />} />
        <Route path="/profile_data" element={<Profile_data />} />
      </Routes>
    </Router>
  );
}

export default App;
