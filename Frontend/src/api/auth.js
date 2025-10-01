import http from "./http";

export const registerUser = (payload) => http.post("/auth/register", payload);
export const loginUser = async (payload) => {
  try {
    const response = await http.post("/auth/login", payload);
    console.log('Login response:', response);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
export const googleLogin = (idToken) => http.post("/auth/google", { idToken });
