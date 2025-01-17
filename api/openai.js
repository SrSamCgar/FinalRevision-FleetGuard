export default async function handler(req, res) {
    console.log('Request received:', req.method); // Log para registrar el método de la solicitud
    if (req.method !== 'POST') {
        console.error('Invalid method:', req.method); // Log del método incorrecto
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, image } = req.body;

    console.log('Request body:', req.body); // Log para inspeccionar el cuerpo de la solicitud

    if (!prompt || !image) {
        console.error('Missing required fields:', { prompt, image }); // Log si faltan campos requeridos
        return res.status(400).json({ error: 'Prompt and image are required' });
    }

    try {
        console.log('Sending request to OpenAI...'); // Log antes de enviar la solicitud a OpenAI

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-2024-08-06', // Asegúrate de usar un modelo compatible con Structured Outputs
                messages: [
                    {
                        role: 'user',
                        content: `Analyze the following vehicle component: ${prompt}`,
                    }
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        strict: true,
                        schema: {
                            type: 'object',
                            properties: {
                                component: {
                                    type: 'string',
                                    description: 'The name of the vehicle component analyzed'
                                },
                                status: {
                                    type: 'string',
                                    description: 'The condition of the component',
                                    enum: ['good', 'bad', 'unknown']
                                },
                                issues: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        description: 'A list of detected issues'
                                    }
                                }
                            },
                            required: ['component', 'status'],
                            additionalProperties: false
                        }
                    }
                },
                max_tokens: 100 // Ajusta según la longitud esperada de la respuesta
            })
        });

        console.log('OpenAI response status:', response.status); // Log del código de estado de OpenAI

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI error response:', errorText); // Log del error detallado
            return res.status(response.status).json({ error: 'OpenAI request failed', details: errorText });
        }

        const data = await response.json();
        // **Log 6: Datos procesados de OpenAI**
        console.log('Raw response from OpenAI:', data);


        // Validar si el modelo rechazó la solicitud
        const refusal = data.choices[0]?.message?.refusal;
        if (refusal) {
            console.warn('OpenAI refusal:', refusal); // Log si OpenAI rechaza la solicitud
            return res.status(200).json({ refusal });
        }

        // Extraer y procesar los datos estructurados
        const structuredResponse = data.choices[0]?.message?.parsed;
        console.log('OpenAI structured response raw:', data); // Log del objeto completo devuelto
        if (!structuredResponse) {
            console.error('Invalid structured response from OpenAI:', data); // Log si la respuesta es inválida
            return res.status(500).json({ error: 'Invalid structured response from OpenAI' });
        }

        console.log('Structured Response:', structuredResponse); // Log de la respuesta procesada
        res.status(200).json({ result: structuredResponse });
    } catch (error) {
        console.error('Error in handler:', error); // Log detallado del error
        res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
}
