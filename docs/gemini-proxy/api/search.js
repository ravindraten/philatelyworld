import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // 1. Get the user's search query from the request
    const { query, stampData } = req.body;
    const allowedOrigins = [
        'http://127.0.0.1:5500', 
        'http://localhost:5500', 
        'https://philatelyworld.in'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // 2. Initialize Gemini using the API Key stored in Environment Variables
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a philately assistant. 
    Based on this stamp catalog: ${JSON.stringify(stampData)}, 
    identify which stamps best match the user's request: "${query}".
    Return ONLY a JSON array of the "folder" names of the matching stamps.`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean the response (Gemini sometimes adds ```json markers)
        const cleanedJson = responseText.replace(/```json|```/g, "").trim();
        
        res.status(200).json(JSON.parse(cleanedJson));
    } catch (error) {
        res.status(500).json({ error: "AI Search Failed" });
    }
}