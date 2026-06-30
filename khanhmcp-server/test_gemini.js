import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function list() {
    try {
        const models = [];
        // The listModels method is on the GoogleGenerativeAI instance
        // depending on the version, or it might be a global.
        // In @google/generative-ai 0.24.1, you should list models via the API.
        
        // Actually, let's just try to generate a tiny content with a few different names
        const testModels = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro", "models/gemini-1.5-flash"];
        for (const m of testModels) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("ping");
                console.log(`✅ Model ${m} works: ${result.response.text().substring(0, 5)}...`);
            } catch (e) {
                console.log(`❌ Model ${m} failed: ${e.message}`);
            }
        }
    } catch (e) {
        console.error(e.message);
    }
}
list();
