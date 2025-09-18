import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import { AuthProvider } from "./context/AuthContext"; // 👈 importamos

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>   {/* 👈 ahora toda la app tiene acceso al contexto */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
