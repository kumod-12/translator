export default async function handler(req, res) {
    const apiKey = (process.env.AZURE_OPENAI_API_KEY || '').trim();
    const apiEndpoint = 'https://ndtv-openai.openai.azure.com/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2025-01-01-preview';

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'Say hi' }]
            })
        });

        const data = await response.json();

        return res.status(200).json({
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: data,
            keyUsed: apiKey.substring(0, 6) + '...' + apiKey.substring(apiKey.length - 4)
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            keyUsed: apiKey.substring(0, 6) + '...' + apiKey.substring(apiKey.length - 4)
        });
    }
}
