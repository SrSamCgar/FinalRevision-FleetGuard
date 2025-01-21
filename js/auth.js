import { supabase } from '../backend/supabaseClient.js';

export class AuthService {
    static async signUp({ email, password, name, role = 'user' }) {
        try {
            // Sign up user with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            // Create worker profile
            const { data: worker, error: workerError } = await supabase
                .from('workers')
                .insert([
                    {
                        id: authData.user.id,
                        email,
                        name,
                        role,
                        status: 'active'
                    }
                ])
                .single();

            if (workerError) throw workerError;

            return { user: authData.user, worker };
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    static async signIn({ email, password }) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Update last login
            await supabase
                .from('workers')
                .update({ last_login: new Date().toISOString() })
                .eq('id', data.user.id);

            return data;
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    static async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    static async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    }

    static async updatePassword(newPassword) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
    }

    static async updateProfile(updates) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const { data, error } = await supabase
            .from('workers')
            .update(updates)
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data;
    }
}
