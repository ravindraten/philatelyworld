import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // Inside your handler in search.js
    const origin = req.headers.origin;

    // Check if it's your local dev, your main domain, or ANY Vercel preview URL
    const isAllowed = 
        origin === 'http://127.0.0.1:5500' || 
        origin === 'http://localhost:5500' || 
        origin === 'https://philatelyworld.in' ||
        (origin && origin.endsWith('.vercel.app')); // This catches all Vercel previews

    if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle the "Preflight" handshake
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // 3. NOW PROCESS THE DATA
    try {
        const { query, stampData } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "API Key missing in Vercel settings" });
        }

        const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prompting Gemini to return exactly what your script.js expects
        const prompt = `You are a philately assistant. 
        Catalog: ${JSON.stringify(stampData.map(s => ({ folder: s.folder, name: s.name, desc: s.desc })))}
        User Query: "${query}"
        Return ONLY a JSON array of the "folder" strings that match. Example: ["D29", "003"]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedJson = responseText.replace(/```json|```/g, "").trim();
        
        res.status(200).json(JSON.parse(cleanedJson));
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "AI Search Failed" });
    }
}