import { createClient } from '@supabase/supabase-js'

// These will be replaced by the actual environment variables in production
const supabaseUrl = process.env.SUPABASE_URL || 'your_fallback_url'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your_fallback_key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to test connection
export async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('workers')
            .select('count')
            .single()
        
        if (error) throw error
        console.log('Supabase connection successful')
        return true
    } catch (error) {
        console.error('Supabase connection failed:', error.message)
        return false
    }
}
