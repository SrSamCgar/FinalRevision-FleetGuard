import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pdfData, filename } = req.body

  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(pdfData.split(',')[1], 'base64')
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('inspection-pdfs')
      .upload(filename, buffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('inspection-pdfs')
      .getPublicUrl(filename)

    return res.status(200).json({ 
      message: 'PDF uploaded successfully',
      url: urlData.publicUrl
    })
  } catch (error) {
    console.error('Error uploading PDF:', error)
    return res.status(500).json({ error: 'Error uploading PDF' })
  }
}
