export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = (process.env.AZURE_OPENAI_API_KEY || '').trim();
    const apiEndpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://ndtv-openai.openai.azure.com/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2025-01-01-preview';

    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { sourceLang, targetLang, sourceText, customInstructions } = req.body;

        if (!sourceLang || !targetLang || !sourceText) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const basePrompt = `Translate the following text from ${sourceLang} to ${targetLang}. Only provide the translation, nothing else.`;
        let prompt;
        if (customInstructions) {
            prompt = basePrompt + '\n\nAdditional instructions: ' + customInstructions + '\n\nText: ' + sourceText;
        } else {
            prompt = basePrompt + '\n\nText: ' + sourceText;
        }

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || 'API error' });
        }

        // Extract translated text
        let translatedText = '';
        if (data.choices && data.choices[0] && data.choices[0].message) {
            translatedText = data.choices[0].message.content;
        }

        return res.status(200).json({ translation: translatedText });

    } catch (error) {
        console.error('Translation error:', error);
        return res.status(500).json({ error: 'Translation failed' });
    }
}
