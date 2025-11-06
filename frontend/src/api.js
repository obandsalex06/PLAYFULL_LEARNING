import axios from "axios";

// Usa variable de entorno si existe, si no, usa proxy de Vite con baseURL relativa
const API = axios.create({
    baseURL: import.meta?.env?.VITE_API_URL || "/api",
});

// Interceptor de request: añade el token a todas las peticiones
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de response: maneja la renovación automática de tokens
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el error es 403 (token expirado) y no hemos intentado refrescar ya
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                
                if (!refreshToken) {
                    // No hay refresh token, redirigir al login
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Intentar refrescar el token
                const { data } = await axios.post('/api/auth/refresh-token', {
                    refreshToken
                });

                // Guardar nuevos tokens
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Reintentar la petición original con el nuevo token
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                // Si falla el refresh, cerrar sesión
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Obtener clases y estudiantes del docente
export const getTeacherClasses = (headers) => API.get("/auth/teacher-classes", { headers });

// Registro
export const registerUser = (data) => API.post("/auth/register", data);

// Login
export const loginUser = (data) => API.post("/auth/login", data);

export default API;