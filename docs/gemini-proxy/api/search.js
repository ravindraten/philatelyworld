import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'http://127.0.0.1:5500', 
        'http://localhost:5500', 
        'https://philatelyworld.in'
    ];
    
    // If the origin is in our list, allow it. 
    // If there is no origin (like a direct server call), we still need to handle the response.
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
        // Fallback for tools or internal hits
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 2. HANDLE PREFLIGHT
    if (req.method === 'OPTIONS') {
        // Crucial: Preflight must return 200 or 204 with the headers above
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