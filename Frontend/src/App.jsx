import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClubTopics from "./pages/ClubTopics";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clubs" element={<Home />} />
        <Route path="/topics" element={<ClubTopics />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Example protected page */}
        <Route path="/dashboard" element={<ProtectedRoute><div style={{ padding: 24 }}>Dashboard (protected)</div></ProtectedRoute>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
