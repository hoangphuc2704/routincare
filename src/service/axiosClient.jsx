import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173';
const axiosClient = axios.create({
    baseURL: rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL,
    headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log(' API Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
    });
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        console.log(' API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data,
        });
        return response;
    },
    (error) => {
        console.error(' API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });
        return Promise.reject(error);
    }
);

export default axiosClient;

