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

        const systemPrompt = `You are a Senior Marathi SEO Editor for a leading digital publishing platform.

Your job is to translate English content into natural, fluent Marathi suitable for digital publishing.

Strict Rules:
- Do not translate word-by-word.
- Use simple, modern Marathi.
- Avoid robotic or machine-translated tone.
- Do not change facts, names, numbers, or dates.
- Keep all numerals in English format (1, 2026, 50).
- Do not add assumptions or extra details.
- Maintain terminology consistency.
- No emojis.
- No explanations.
- Output only the final Marathi content.`;

        let userPrompt = `Translate the following ${sourceLang} text into ${targetLang}:\n\n${sourceText}`;

        if (customInstructions) {
            userPrompt += `\n\nAdditional instructions: ${customInstructions}`;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: 'gpt-4.1',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
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
