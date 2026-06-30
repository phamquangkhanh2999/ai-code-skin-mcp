import { ToolHandler } from "./ToolHandler.js";
import { DBService } from "../db/db.service.js";
import { dbPool } from "../db/connection.js";
import { AIService } from "../services/ai.service.js";
import { JobQueue, JobStatus } from "../middleware/JobQueue.js";
import { Logger } from "../utils/logger.js";
import { z } from "zod";

const schema = z.object({
    projectName: z.string().min(1, "Ten du an bat buoc"),
    ideaDescription: z.string().min(5, "Mo ta y tuong can it nhat 5 ky tu de phan tich"),
    moduleNameFocus: z.string().optional().default("Core")
});

export class RunFullAnalysisWorkflowTool implements ToolHandler {
    name = "run_full_analysis_workflow";
    description = "Quy trinh tu dong Gemini Analysis -> Caching -> Gemini PRD -> MySQL Storage";
    inputSchema = {
        type: "object",
        properties: {
            projectName: { type: "string" },
            ideaDescription: { type: "string" },
            moduleNameFocus: { type: "string", description: "Module can tap trung viet PRD" }
        },
        required: ["projectName", "ideaDescription"]
    };

    async execute(args: any) {
        const parsed = schema.safeParse(args);
        if (!parsed.success) return { content: [{ type: "text", text: `Loi tham so: ${parsed.error.message}` }], isError: true };

        const { projectName, ideaDescription, moduleNameFocus } = parsed.data;
        const jobId = await JobQueue.registerJob(projectName, moduleNameFocus);
        
        await JobQueue.updateJobStatus(jobId, JobStatus.PROCESSING);

        const connection = await dbPool.getConnection();
        await connection.beginTransaction();

        try {
            const projectId = await DBService.createOrGetProject(projectName, ideaDescription, connection);

            // --- SMART CACHING (SEMANTIC REUSE) ---
            Logger.info(`[Step 0] Checking for similar ideas in DB...`);
            const currentVector = await AIService.generateEmbedding(ideaDescription);
            const pastLogs = await DBService.findSimilarAnalysis(ideaDescription, connection);
            
            let analysisText = "";
            let cachedFound = false;

            for (const log of pastLogs) {
                const pastVector = log.prompt_vector;
                if (pastVector) {
                    const similarity = AIService.calculateSimilarity(currentVector, pastVector);
                    if (similarity > 0.96) { // Ngưỡng tương đồng cao
                        Logger.info(`[Caching] Found semantic match (${(similarity * 100).toFixed(2)}%). Reusing result.`);
                        analysisText = log.gemini_analysis;
                        cachedFound = true;
                        break;
                    }
                }
            }

            // --- AI ANALYSIS (GEMINI) ---
            if (!cachedFound) {
                Logger.info(`[Step 1] No cache found. Calling Gemini 2.5 Analysis...`);
                analysisText = await AIService.analyzeIdea(ideaDescription);
                await DBService.saveAnalysis(projectId, ideaDescription, currentVector, analysisText, connection);
            }

            // --- PRD GENERATION (GEMINI) ---
            Logger.info(`[Step 2] Calling Gemini 2.5 for PRD Module: ${moduleNameFocus}...`);
            const prdText = await AIService.generatePRD(analysisText, moduleNameFocus);
            
            // --- VECTOR EMBEDDING FOR PRD ---
            const prdVector = await AIService.generateEmbedding(prdText);
            await DBService.savePRD(projectId, moduleNameFocus, prdText, prdVector, connection);

            await connection.commit();
            await JobQueue.updateJobStatus(jobId, JobStatus.COMPLETED);

            return { 
                content: [{ 
                    type: "text", 
                    text: `✅ Hoan thanh Workflow [${projectName}] (ID: ${jobId}).\n\n` +
                         `- ${cachedFound ? "♻️ Reused Analysis from Cache" : "🧠 Generated New Analysis"}\n` +
                         `- PRD Module [${moduleNameFocus}] added via Gemini 2.5.\n` +
                         `- Architecture optimized for zero-OpenAI usage.\n\n` +
                         `Dung 'project_snapshot' de xem ket qua.` 
                }] 
            };

        } catch (error: any) {
            await connection.rollback();
            await JobQueue.updateJobStatus(jobId, JobStatus.FAILED, error.message);
            Logger.error("Workflow failed, data rolled back.", error);
            return { content: [{ type: "text", text: `❌ Loi Workflow (Da Rollback): ${error.message}` }], isError: true };
        } finally {
            connection.release();
        }
    }
}
