import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Clubs from "./pages/Clubs";
import ClubTopics from "./pages/ClubTopics";
import ClubAdminDashboard from './pages/ClubAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ViewIdeas from "./pages/ViewIdeas";
import Leaderboard from "./pages/Leaderboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationBell from "./components/NotificationBell";
import AchievementBadge from "./components/AchievementBadge";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
        <Route path="/topics" element={<ProtectedRoute><ClubTopics /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/events/:eventId/ideas" element={<ProtectedRoute><ViewIdeas /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><ClubAdminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Example protected page */}
        <Route path="/dashboard" element={<ProtectedRoute><div style={{ padding: 24 }}>Dashboard (protected)</div></ProtectedRoute>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
