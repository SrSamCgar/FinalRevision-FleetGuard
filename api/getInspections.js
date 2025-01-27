import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { worker_id, isAdmin } = req.query; // Parámetros de la URL
  console.log('Worker ID received:', worker_id); // Log del worker_id recibido
    console.log('Is Admin received:', isAdmin);   // Log del rol recibido
  try {
    let query = supabase
      .from('inspections')
      .select('*');

    if (!isAdmin || isAdmin === 'false') {
      // Si no es administrador, filtrar por worker_id
      if (!worker_id) {
        return res.status(400).json({ error: 'worker_id is required for non-admin users' });
      }
      query = query.eq('worker_id', worker_id);
    } else {
      // Si es administrador, aplica filtros adicionales si se proporciona worker_id
      if (worker_id) {
        query = query.eq('worker_id', worker_id);
      }
    }
    // Log para ver la consulta generada
      console.log('Generated query:', query);
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log('Data fetched from database:', data); // Agrega este log
    return res.status(200).json({ inspections: data });
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return res.status(500).json({ error: error.message });
  }
}
