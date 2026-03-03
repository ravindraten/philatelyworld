import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'http://127.0.0.1:5500', 
        'http://localhost:5500', 
        'https://philatelyworld.in'
    ];
    
    // If the origin matches, use it. If not (and it's a dev environment), 
    // you might want to allow it anyway to avoid this exact error.
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV === 'development') {
        res.setHeader('Access-Control-Allow-Origin', '*');
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