import { create } from 'zustand';
import api from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? sessionStorage.getItem('interviewiq-token') : null,
    isLoading: false,
    isAuthenticated: false,

    login: async (email: string, password: string) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            sessionStorage.setItem('interviewiq-token', data.token);
            set({ user: data.user, token: data.token, isAuthenticated: true });
        } catch (err: any) {
            throw new Error(err?.error || err?.message || 'Login failed. Is the backend server running on port 3001?');
        }
    },

    register: async (name: string, email: string, password: string) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            sessionStorage.setItem('interviewiq-token', data.token);
            set({ user: data.user, token: data.token, isAuthenticated: true });
        } catch (err: any) {
            throw new Error(err?.error || err?.message || 'Registration failed. Is the backend server running on port 3001?');
        }
    },

    logout: () => {
        sessionStorage.removeItem('interviewiq-token');
        localStorage.removeItem('interviewiq-token'); // Clean up old localStorage token too
        set({ user: null, token: null, isAuthenticated: false });
    },

    loadUser: async () => {
        try {
            set({ isLoading: true });
            const { data } = await api.get('/auth/profile');
            set({ user: data, isAuthenticated: true, isLoading: false });
        } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
