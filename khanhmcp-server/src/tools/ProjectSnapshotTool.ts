import { ToolHandler } from "./ToolHandler.js";
import { DBService } from "../db/db.service.js";
import { z } from "zod";

const schema = z.object({
    projectName: z.string().min(1, "Ten du an khong duoc de trong")
});

export class ProjectSnapshotTool implements ToolHandler {
    name = "project_snapshot";
    description = "Lay bao cao tong the cua du an";
    inputSchema = {
        type: "object",
        properties: {
            projectName: { type: "string" }
        },
        required: ["projectName"]
    };

    async execute(args: any) {
        const parsed = schema.safeParse(args);
        if (!parsed.success) return { content: [{ type: "text", text: `Loi tham so: ${parsed.error.message}` }], isError: true };
        
        const { projectName } = parsed.data;
        const snapshotData = await DBService.getProjectSnapshot(projectName);
        
        if (!snapshotData) return { content: [{ type: "text", text: `Du an ${projectName} khong ton tai.` }] };
        
        const snapshot = `SNAPSHOT DU AN: ${projectName}\n`
            + `Tom tat y tuong: ${snapshotData.summary}\n`
            + `So luot phan tich (Gemini): ${snapshotData.analysisCount}\n`
            + `Cac Module PRD hien co (OpenAI):\n`
            + `${snapshotData.prds.map((p: any) => `- Module: ${p.module_name} (Updated: ${p.updated_at})`).join("\n")}\n\n`
            + `So luong Snippets trong he thong: ${snapshotData.snippetCount}`;
            
        return { content: [{ type: "text", text: snapshot }] };
    }
}
