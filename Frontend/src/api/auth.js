import http from "./http";

export const registerUser = (payload) => http.post("/auth/register", payload);
export const loginUser = (payload) => http.post("/auth/login", payload);
export const googleLogin = (idToken) => http.post("/auth/google", { idToken });
