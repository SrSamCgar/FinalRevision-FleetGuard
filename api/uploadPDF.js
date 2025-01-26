import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!file) {
      throw new Error('No file provided');
    }

    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase
      .storage
      .from('inspection-pdfs')
      .upload(`inspections/${file.name}`, buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) throw error;

    const { data: urlData } = supabase
      .storage
      .from('inspection-pdfs')
      .getPublicUrl(`inspections/${file.name}`);

    return res.status(200).json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return res.status(500).json({ error: 'Error uploading PDF' });
  }
}
/*import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pdfData, filename, inspectionId } = req.body

  try {
    const buffer = Buffer.from(pdfData.split(',')[1], 'base64')
    
    const { data, error } = await supabase
      .storage
      .from('inspection-pdfs')
      .upload(`inspections/${filename}`, buffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (error) throw error

    const { data: urlData } = supabase
      .storage
      .from('inspection-pdfs')
      .getPublicUrl(`inspections/${filename}`)

    return res.status(200).json({ 
      url: urlData.publicUrl
    })
  } catch (error) {
    console.error('Error uploading PDF:', error)
    return res.status(500).json({ error: 'Error uploading PDF' })
  }
}
*/
