export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = (process.env.OPENAI_API_KEY || '').trim();

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

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
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
