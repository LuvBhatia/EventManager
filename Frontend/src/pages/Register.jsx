import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Register() {
  const [payload, setPayload] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setPayload({ ...payload, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(payload);
      alert("Registered successfully. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err?.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Create an account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input name="name" placeholder="Full name" value={payload.name} onChange={handleChange} required />
          <input name="email" placeholder="Email" value={payload.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={payload.password} onChange={handleChange} required />
          <select name="role" value={payload.role} onChange={handleChange}>
            <option value="STUDENT">Student</option>
            <option value="CLUB_ADMIN">Club Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
        </form>
        <p className="muted">Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
}
