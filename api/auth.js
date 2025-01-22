/*import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { workerId, password } = req.body

  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .single()

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Compare password_hash (implement proper password comparison)
       const passwords = {
      '9999': 'admin123',
      '1234': 'abcd1234', 
      '9876': 'carlos9876'
    };
    
    if (passwords[workerId] !== password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    return res.status(200).json({ 
      user: {
        id: data.id,
        name: data.name,
        role: data.role,
        status: data.status
      }
    })
  } catch (error) {
    return res.status(500).json({ error: 'Server error' })
  }
}*/
// api/auth.js
/*import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { workerId, password } = req.body;
  console.log('Login attempt for:', workerId); // Debug log

  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return res.status(500).json({ error: 'Database connection error' });
    }

    const { data: user, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.password_hash !== `hashed_${password}`) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}*/
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test connection
    const { data, error } = await supabase
      .from('workers')
      .select('count')
      .single();

    if (error) {
      console.error('Connection error:', error);
      return res.status(500).json({ 
        error: 'Database connection error',
        details: error.message,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'URL exists' : 'No URL',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Key exists' : 'No key'
      });
    }

    return res.status(200).json({ message: 'Connection successful', data });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
}
