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
        const { sourceLang, targetLang, sourceText, systemPrompt, userPrompt, model } = req.body;

        if (!sourceLang || !targetLang || !sourceText) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const allowedModels = ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o', 'gpt-4o-mini'];
        const selectedModel = allowedModels.includes(model) ? model : 'gpt-4.1';

        const finalSystemPrompt = systemPrompt || 'You are a professional translator. Translate accurately and naturally. Output only the translation.';

        let userMessage = `Translate the following ${sourceLang} text into ${targetLang}:\n\n${sourceText}`;

        if (userPrompt) {
            userMessage += `\n\n${userPrompt}`;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    { role: 'system', content: finalSystemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.3
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
