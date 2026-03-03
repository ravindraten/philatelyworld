import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // 1. IMMEDIATE CORS HANDLING
    const origin = req.headers.origin;
    const allowedOrigins = [
        'http://127.0.0.1:5500', 
        'http://localhost:5500', 
        'https://philatelyworld.in'
    ];
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. Handle Preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Logic starts here
    try {
        const { query, stampData } = req.body;
        const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a philately assistant. Based on this catalog: ${JSON.stringify(stampData)}, find stamps matching: "${query}". Return ONLY a JSON array of "folder" names. Example: ["D29", "003"]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedJson = responseText.replace(/```json|```/g, "").trim();
        
        res.status(200).json(JSON.parse(cleanedJson));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "AI Error" });
    }
}