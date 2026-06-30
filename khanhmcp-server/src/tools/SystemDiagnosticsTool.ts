import { ToolHandler } from "./ToolHandler.js";
import { Logger } from "../utils/logger.js";
import { DBService } from "../db/db.service.js";

export class SystemDiagnosticsTool implements ToolHandler {
    name = "system_diagnostics";
    description = "Kiem tra trang thai ket noi API Keys va Database";
    inputSchema = { type: "object", properties: {} };

    async execute(args: any) {
        Logger.info("Chay system_diagnostics check...");
        let dbStatus = "❌ Disconnected";
        let openAiStatus = "❌ Invalid or Missing Key";
        let geminiStatus = "❌ Invalid or Missing Key";

        try {
            await DBService.searchContext("test_ping");
            dbStatus = "✅ Connected (MySQL up and running)";
        } catch(e) {
            Logger.error("DB Ping failed in diagnostics", e);
        }

        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith("sk-")) openAiStatus = "✅ Key exists (Optional)";
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("AIza")) geminiStatus = "✅ Key loaded properly (Primary Engine)";

        const res = `[DIAGNOSTICS REPORT - GEMINI-CENTRIC ARCHITECTURE]\n\n- MySQL Database : ${dbStatus}\n- Gemini 2.5 API : ${geminiStatus}\n- OpenAI Legacy  : ${openAiStatus}\n\n(Hien tai he thong da chuyen sang dung Gemini cho moi tac vu PRD va Analysis de toi uu chi phi.)`;
        Logger.info("Diagnostics hoan tat.");
        return { content: [{ type: "text", text: res }] };
    }
}
