import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    // 1. Setup CORS for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { query, stampData } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "GEMINI_API_KEY is not set in Vercel" });
        }

        const genAI = new GoogleGenAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a philately assistant. 
        Catalog: ${JSON.stringify(stampData.map(s => ({ folder: s.folder, name: s.name, desc: s.desc })))}
        User Query: "${query}"
        Return ONLY a JSON array of the "folder" strings that match. No markdown. Example: ["D29", "003"]`;

        // 2. THE CRITICAL FIX: Added 'await' to result.response and response.text()
        const result = await model.generateContent(prompt);
        const response = await result.response; 
        const responseText = response.text(); // This was the missing 'await' area

        // 3. Clean and Parse JSON
        const cleanedJson = responseText.replace(/```json|```/g, "").trim();
        const folderArray = JSON.parse(cleanedJson);

        res.status(200).json(folderArray);

    } catch (error) {
        console.error("Vercel Function Error:", error);
        res.status(500).json({ error: error.message });
    }
}