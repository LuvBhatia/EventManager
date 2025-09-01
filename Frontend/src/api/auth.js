import http from "./http";

export const registerUser = (payload) => http.post("/api/auth/register", payload);
export const loginUser = (payload) => http.post("/api/auth/login", payload);
