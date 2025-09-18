import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Registro
export const registerUser = (data) => API.post("/auth/register", data);

// Login
export const loginUser = (data) => API.post("/auth/login", data);
