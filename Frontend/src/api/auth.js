import http from "./http";

export const registerUser = (payload) => http.post("/api/auth/register", payload);
export const loginUser = (payload) => http.post("/api/auth/login", payload);
export const googleLogin = (idToken) => http.post("/api/auth/google", { idToken });
