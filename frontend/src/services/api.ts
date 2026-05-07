/// <reference types="vite/client" />
import axios, { AxiosInstance } from 'axios';

// Use relative URL so the Vite proxy handles routing to the backend.
// This works for both localhost and network-IP access (QR code table ordering from phones).
const baseUrl = import.meta.env.VITE_API_URL ?? '/api';

export const api: AxiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});
