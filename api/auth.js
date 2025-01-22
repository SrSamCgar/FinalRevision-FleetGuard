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
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { workerId, password } = req.body;
  console.log('Login attempt:', { workerId }); // Debug log

  // Temporary hard-coded credentials while DB setup completes
  const users = {
    '9999': { password: 'admin123', name: 'Admin User', role: 'admin', status: 'active' },
    '1234': { password: 'abcd1234', name: 'Juan Ramon', role: 'user', status: 'active' },
    '9876': { password: 'carlos9876', name: 'Carlos Perez', role: 'auditor', status: 'active' }
  };

  try {
    const user = users[workerId];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      user: {
        id: workerId,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
