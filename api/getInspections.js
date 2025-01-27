// New file: getInspections.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { worker_id } = req.body;

  try {
    let query = supabase
      .from('inspections')
      .select('*');

    // If not admin, filter by worker_id
    if (worker_id) {
      query = query.eq('worker_id', worker_id);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({ inspections: data });
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return res.status(500).json({ error: error.message });
  }
}
