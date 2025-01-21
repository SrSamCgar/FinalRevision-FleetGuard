import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Admin client for backend operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Public client for frontend operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to test connection
export async function testConnection() {
    try {
        const { data, error } = await supabaseAdmin
            .from('workers')
            .select('count')
            .single();
        if (error) throw error;
        console.log('Supabase connection successful');
        return true;
    } catch (error) {
        console.error('Supabase connection failed:', error.message);
        return false;
    }
}

// Helper function to get current session
export async function getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

// Helper function to get current user
export async function getCurrentUser() {
    const session = await getCurrentSession();
    if (!session) return null;
    
    const { data: worker, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
    if (error) throw error;
    return worker;
}
