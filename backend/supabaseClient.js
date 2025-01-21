// backend/supabaseClient.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

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
