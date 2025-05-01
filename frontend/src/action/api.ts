import axios from "axios";

// API configuration
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Create axios instance with default config
export const api = axios.create({
  baseURL: 'http://localhost:8000/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && config.method !== "get") {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  config.withCredentials = true;

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    if (error.response && error.response.status === 401) {
      console.log("Hi to whoever seeing this :)");
    }
    return Promise.reject(error);
  }
);

export default api; 