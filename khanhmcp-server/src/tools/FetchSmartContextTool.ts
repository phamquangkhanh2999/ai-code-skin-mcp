import { ToolHandler } from "./ToolHandler.js";
import { DBService } from "../db/db.service.js";
import { AIService } from "../services/ai.service.js";
import { z } from "zod";

const schema = z.object({
    keyword: z.string().min(1, "Ban can nhap tu khoa de tim kiem")
});

export class FetchSmartContextTool implements ToolHandler {
    name = "fetch_smart_context";
    description = "Tim kiem thong minh trong context DB tiet kiem Token";
    inputSchema = {
        type: "object",
        properties: {
            keyword: { type: "string" }
        },
        required: ["keyword"]
    };

    async execute(args: any) {
        const parsed = schema.safeParse(args);
        if (!parsed.success) return { content: [{ type: "text", text: `Loi tham so: ${parsed.error.message}` }], isError: true };

        const { keyword } = parsed.data;
        
        // 1. Chuyen tu khoa/cau hoi thanh Vector
        const queryVector = await AIService.generateEmbedding(keyword);
        
        // 2. Lay Toan Bo Vector trong he thong DB len Node
        const allVectors = await DBService.getAllVectors();
        
        if (allVectors.length === 0) {
            // Fallback ve search keyword neu chua co vector
            const rows = await DBService.searchContext(keyword);
            if (rows.length === 0) return { content: [{ type: "text", text: `Khong tim thay context chua tu khoa "${keyword}".` }] };
            return { content: [{ type: "text", text: rows.map((r: any) => `[${r.type} - ${r.name}]:\n${r.content}`).join("\n\n---\n\n") }] };
        }

        // 3. Tinh khoang cach Cosine Similarity (Dung AIService)
        const matchScores = allVectors.map((r: any) => {
            const dbVector = typeof r.vector_json === "string" ? JSON.parse(r.vector_json) : r.vector_json;
            const score = AIService.calculateSimilarity(queryVector, dbVector);
            return { ...r, score };
        });

        // 4. Sort va lay top 5
        matchScores.sort((a: any, b: any) => b.score - a.score);
        const topResults = matchScores.slice(0, 5).filter((r: any) => r.score > 0.3);
        
        if (topResults.length === 0) return { content: [{ type: "text", text: `Khong tim thay context nao phu hop cho "${keyword}".` }] };
        
        const contextText = topResults.map((r: any) => `[${r.type} - ${r.name} | Similarity: ${(Math.round(r.score * 100))}%]:\n${r.content}`).join("\n\n---\n\n");
        return { content: [{ type: "text", text: contextText }] };
    }
}
