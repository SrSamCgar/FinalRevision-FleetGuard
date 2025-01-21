import { supabase, getCurrentUser } from '../backend/supabaseClient.js';

export const AuthMiddleware = {
    async requireAuth() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = '/login.html';
                return false;
            }
            return true;
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = '/login.html';
            return false;
        }
    },

    async requireRole(allowedRoles) {
        try {
            const worker = await getCurrentUser();
            if (!worker || !allowedRoles.includes(worker.role)) {
                window.location.href = '/unauthorized.html';
                return false;
            }
            return true;
        } catch (error) {
            console.error('Role check failed:', error);
            window.location.href = '/unauthorized.html';
            return false;
        }
    },

    async redirectIfAuthenticated() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                window.location.href = '/dashboard.html';
                return true;
            }
            return false;
        } catch (error) {
            console.error('Session check failed:', error);
            return false;
        }
    }
};
