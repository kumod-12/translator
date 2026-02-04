export default async function handler(req, res) {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;

    return res.status(200).json({
        hasKey: !!apiKey,
        keyLength: apiKey ? apiKey.length : 0,
        keyPreview: apiKey ? apiKey.substring(0, 4) + '...' : 'NOT SET'
    });
}
