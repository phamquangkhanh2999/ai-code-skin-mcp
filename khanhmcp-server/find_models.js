import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function findModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        if (data.models) {
            const filtered = data.models
                .filter(m => m.name.includes('flash') || m.name.includes('pro'))
                .map(m => m.name);
            console.log("VALID MODELS FOUND:");
            console.log(JSON.stringify(filtered, null, 2));
        } else {
            console.log("No models found. Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}
findModels();
