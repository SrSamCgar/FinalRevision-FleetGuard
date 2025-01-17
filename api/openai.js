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
                model: 'gpt-4-turbo',
                messages: [
                    {
                        role: 'user',
                        content: `Analyze the following vehicle component: ${prompt}`,
                    }
                ],
                functions: [
                    {
                        name: "analyze_vehicle_component",
                        description: "Analyze a vehicle component and return a structured JSON output.",
                        parameters: {
                            type: "object",
                            properties: {
                                component: { type: "string", description: "The name of the component" },
                                status: { type: "string", description: "The condition of the component" },
                                issues: {
                                    type: "array",
                                    items: { type: "string", description: "List of detected issues" }
                                }
                            },
                            required: ["component", "status"]
                        }
                    }
                ],
                max_tokens: 100
            })
        });

        const data = await response.json();

        if (response.ok && data.choices.length > 0) {
            const choice = data.choices[0];
            if (!choice?.message?.function_call?.arguments) {
                console.error('function_call.arguments no está presente o es inválido:', data);
                return res.status(500).json({ error: 'Invalid structured response from OpenAI' });
            }

            let parsedArguments;
            try {
                parsedArguments = JSON.parse(choice.message.function_call.arguments);
            } catch (error) {
                console.error('Error al parsear arguments:', error);
                return res.status(500).json({ error: 'Invalid JSON in function_call.arguments' });
            }

            res.status(200).json({
                result: parsedArguments
            });
        } else {
            console.error('Error en la respuesta de OpenAI:', data);
            res.status(response.status).json({ error: data });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
}
