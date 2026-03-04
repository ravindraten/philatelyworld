import { GoogleGenAI } from "@google/generative-ai";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { query, stampData } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(500).json({ error: "API Key missing" });
        if (!stampData) return res.status(400).json({ error: "Stamp data missing" });

        const genAI = new GoogleGenAI(apiKey);
        // Using 'latest' alias to avoid 404 model errors
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `You are a philately assistant. 
        Catalog: ${JSON.stringify(stampData.map(s => ({ folder: s.folder, name: s.name, desc: s.desc })))}
        User Query: "${query}"
        Return ONLY a JSON array of the "folder" strings that match. No markdown. Example: ["D29", "003"]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = await response.text(); // FIXED: Added await

        // Clean any markdown backticks the AI might add
        const cleanedJson = responseText.replace(/```json|```/g, "").trim();
        const folderArray = JSON.parse(cleanedJson);

        res.status(200).json(folderArray);
    } catch (error) {
        console.error("Vercel Error:", error);
        res.status(500).json({ error: error.message });
    }
}