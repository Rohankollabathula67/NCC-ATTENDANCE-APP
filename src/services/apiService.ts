import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('ncc_auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('ncc_auth_token');
            localStorage.removeItem('ncc_user_realtime');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// ============= AUTH API =============
export const authAPI = {
    login: async (username: string, password: string) => {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('ncc_auth_token', response.data.token);
        }
        return response.data;
    },

    register: async (username: string, password: string, name: string, role: string = 'admin') => {
        const response = await api.post('/auth/register', { username, password, name, role });
        if (response.data.token) {
            localStorage.setItem('ncc_auth_token', response.data.token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('ncc_auth_token');
        localStorage.removeItem('ncc_user_realtime');
    }
};

// Helper to map _id to id
const mapId = (item: any) => ({ ...item, id: item._id });

// ============= CADETS API =============
export const cadetsAPI = {
    getAll: async (filters?: { wing?: string; platoon?: string; rank?: string }) => {
        const response = await api.get('/cadets', { params: filters });
        return response.data.map(mapId);
    },

    getById: async (id: string) => {
        const response = await api.get(`/cadets/${id}`);
        return mapId(response.data);
    },

    create: async (cadetData: any) => {
        const response = await api.post('/cadets', cadetData);
        return mapId(response.data);
    },

    update: async (id: string, cadetData: any) => {
        const response = await api.put(`/cadets/${id}`, cadetData);
        return mapId(response.data);
    },

    delete: async (id: string) => {
        const response = await api.delete(`/cadets/${id}`);
        return response.data;
    }
};

// ============= ATTENDANCE API =============
export const attendanceAPI = {
    getAll: async (filters?: { date?: string; startDate?: string; endDate?: string }) => {
        const response = await api.get('/attendance', { params: filters });
        return response.data;
    },

    getByDate: async (date: string) => {
        const response = await api.get(`/attendance/date/${date}`);
        return response.data;
    },

    getCadetHistory: async (cadetId: string, limit: number = 30) => {
        const response = await api.get(`/attendance/cadet/${cadetId}`, { params: { limit } });
        return response.data;
    },

    markAttendance: async (date: string, records: Record<string, string>) => {
        const response = await api.post('/attendance', { date, records });
        return response.data;
    },

    update: async (id: string, data: { status?: string; notes?: string }) => {
        const response = await api.put(`/attendance/${id}`, data);
        return response.data;
    }
};

// ============= NOTIFICATIONS API =============
export const notificationsAPI = {
    getAll: async () => {
        const response = await api.get('/notifications');
        return response.data.map(mapId);
    },

    getUnread: async () => {
        const response = await api.get('/notifications/unread');
        return response.data.map(mapId);
    },

    create: async (data: { title: string; message: string; type?: string; recipientId?: string }) => {
        const response = await api.post('/notifications', data);
        return mapId(response.data);
    },

    markAsRead: async (id: string) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return mapId(response.data);
    },

    clearAll: async () => {
        const response = await api.delete('/notifications');
        return response.data;
    }
};

// ============= DRILLS API =============
export const drillsAPI = {
    getAll: async (upcoming: boolean = false) => {
        const response = await api.get('/drills', { params: { upcoming } });
        return response.data.map(mapId);
    },

    create: async (data: {
        title: string;
        date: string;
        description: string;
        mandatory?: boolean;
        sendNotification?: boolean;
    }) => {
        const response = await api.post('/drills', data);
        return mapId(response.data);
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/drills/${id}`, data);
        return mapId(response.data);
    },

    delete: async (id: string) => {
        const response = await api.delete(`/drills/${id}`);
        return response.data;
    }
};

export default api;
