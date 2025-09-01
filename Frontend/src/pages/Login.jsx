import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import "./Auth.css";

export default function Login() {
  const [payload, setPayload] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setPayload({ ...payload, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(payload);
      const { token, email, role } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input name="email" placeholder="Email" value={payload.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={payload.password} onChange={handleChange} required />
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="muted">Don't have an account? <a href="/register">Register</a></p>
      </div>
    </div>
  );
}
