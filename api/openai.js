export default async function handler(req, res) {
    console.log('Request received:', req.method);
    
    if (req.method !== 'POST') {
        console.error('Invalid method:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, image } = req.body;

    console.log('Request body:', req.body);

    if (!prompt || !image) {
        console.error('Missing required fields:', { prompt, image });
        return res.status(400).json({ error: 'Prompt and image are required' });
    }

    try {
        console.log('Sending request to OpenAI...');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-2024-08-06', // Modelo compatible con Structured Outputs
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI that analyzes vehicle components.'
                    },
                    {
                        role: 'user',
                        content: `Analyze the following vehicle component: ${prompt}`
                    }
                ],
                response_format: {
                    type: 'json_schema',
                    name: 'analyze_vehicle_component', // Nombre del esquema
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
                max_tokens: 100
            })
        });

        console.log('OpenAI response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI error response:', errorText);
            return res.status(response.status).json({ error: 'OpenAI request failed', details: errorText });
        }

        const data = await response.json();

        // Validar si el modelo rechazó la solicitud
        const refusal = data.choices[0]?.message?.refusal;
        if (refusal) {
            console.warn('OpenAI refusal:', refusal);
            return res.status(200).json({ refusal });
        }

        // Extraer y procesar los datos estructurados
        const structuredResponse = data.choices[0]?.message?.parsed;
        console.log('Structured Response:', structuredResponse);

        if (!structuredResponse) {
            console.error('Invalid structured response from OpenAI:', data);
            return res.status(500).json({ error: 'Invalid structured response from OpenAI' });
        }

        res.status(200).json({ result: structuredResponse });
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
}
