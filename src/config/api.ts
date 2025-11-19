// src/config/api.ts
export const API_PORT = 5000;

// Your laptop Wi-Fi IP from `ifconfig` (wlp1s0: inet 10.164.88.92)
export const API_HOST = '10.45.212.92';

export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;

export const API_TIMEOUT = 15000; // 15 seconds
