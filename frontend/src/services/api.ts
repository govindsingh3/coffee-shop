import axios, { AxiosInstance } from 'axios';

// Vite exposes env vars via `import.meta.env`. Use `VITE_API_URL` if provided.
const baseUrl = (import.meta.env && (import.meta.env.VITE_API_URL as string)) || 'http://localhost:3000/api';

export const api: AxiosInstance = axios.create({
  // Backend runs with a context path of /api (see backend application.properties)
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});
