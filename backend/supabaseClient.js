import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

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
