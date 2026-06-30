import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';
import { SYSTEM_SKILLS_PROMPT } from '../prompts/systemprompts.js';
import { RateLimiter } from '../middleware/RateLimiter.js';
import { Logger } from '../utils/logger.js';

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

export class AIService {
    /**
     * Giai doan 1: Phan tich y tuong bang Gemini 2.5 Flash
     */
    static async analyzeIdea(ideaDescription: string): Promise<string> {
        if (!ENV.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY in .env');

        return await RateLimiter.wrap(async () => {
            Logger.info("[AIService] Calling Gemini for Analysis...");
            const analyzePrompt = `${SYSTEM_SKILLS_PROMPT}\n\nHay phan tich y tuong sau thanh luong kien truc he thong tong quan:\n${ideaDescription}`;
            const result = await geminiModel.generateContent(analyzePrompt);
            return result.response.text();
        });
    }

    /**
     * Giai doan 2: Viet PRD chi tiet bang Gemini 2.5 Flash (Thay the OpenAI)
     */
    static async generatePRD(analysisResult: string, targetModule: string): Promise<string> {
        if (!ENV.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY in .env');

        return await RateLimiter.wrap(async () => {
            Logger.info("[AIService] Calling Gemini for PRD Generation...");
            const prdPrompt = `${SYSTEM_SKILLS_PROMPT}\n\nDuoi day la phan tich he thong:\n${analysisResult}\n\nHay viet PRD chi tiet cho module: ${targetModule}. Tap trung vao tinh nang, UX/UI va logic nghiep vu chi tiet.`;
            const result = await geminiModel.generateContent(prdPrompt);
            return result.response.text();
        });
    }

    /**
     * Tao Embeddings cho PRD hoac Idea
     */
    static async generateEmbedding(text: string): Promise<number[]> {
        if (!ENV.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY in .env');
        const result = await embedModel.embedContent(text);
        return result.embedding.values;
    }

    /**
     * Tinh toan do tuong dong Cosine Similarity cho Smart Caching
     */
    static calculateSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
