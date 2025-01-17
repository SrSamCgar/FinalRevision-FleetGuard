export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, image } = req.body;

    if (!prompt || !image) {
        return res.status(400).json({ error: 'Prompt and image are required' });
    }

    try {
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
                max_tokens: 200 // Ajusta según la longitud esperada de la respuesta
            })
        });

        if (!response.ok) {
            console.error('OpenAI error response:', await response.text());
            return res.status(response.status).json({ error: 'OpenAI request failed' });
        }

        const data = await response.json();

        // Validar si el modelo rechazó la solicitud
        const refusal = data.choices[0]?.message?.refusal;
        if (refusal) {
            return res.status(200).json({ refusal });
        }

        // Extraer y procesar los datos estructurados
        const structuredResponse = data.choices[0]?.message?.parsed;
        if (!structuredResponse) {
            return res.status(500).json({ error: 'Invalid structured response from OpenAI' });
        }

        console.log('Structured Response:', structuredResponse);
        res.status(200).json({ result: structuredResponse });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
}
