import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Accede a las variables con el prefijo NEXT_PUBLIC_
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to test connection
export async function testConnection() {
    try {
        const { data, error } = await supabase
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
