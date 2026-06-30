import { ToolHandler } from "./ToolHandler.js";
import { DBService } from "../db/db.service.js";

export class ListCodeSnippetsTool implements ToolHandler {
    name = "list_code_snippets";
    description = "Lay danh sach cac module code mau de tai su dung";
    inputSchema = { type: "object", properties: {} };

    async execute(args: any) {
        const snippets = await DBService.getSnippets();
        if (snippets.length === 0) return { content: [{ type: "text", text: "Thu vien code snippets hien dang trong." }] };
        
        const result = snippets.map((s: any) => `- [${s.skill_category}] ${s.snippet_name}: ${s.best_practices}`).join("\n");
        return { content: [{ type: "text", text: `DANH SACH CODE SNIPPETS (SKILLS):\n${result}` }] };
    }
}
