import { ToolHandler } from "./ToolHandler.js";
import fs from "fs";
import path from "path";
import { z } from "zod";

const schema = z.object({
    lines: z.number().optional().default(50)
});

export class ReadServerLogsTool implements ToolHandler {
    name = "read_server_logs";
    description = "Doc nhat ky (log) cua he thong MCP Server ngay trong IDE ma khong can mo file";
    inputSchema = {
        type: "object",
        properties: {
            lines: { type: "number", description: "So dong log cuoi cung muon doc (mac dinh 50)" }
        }
    };

    async execute(args: any) {
        // Validate bang Zod
        const parsed = schema.safeParse(args);
        if (!parsed.success) {
            return { content: [{ type: "text", text: `Loi tham so: ${parsed.error.message}` }], isError: true };
        }
        
        const linesToRead = parsed.data.lines;
        const logPath = path.resolve(process.cwd(), "server.log");
        if (!fs.existsSync(logPath)) {
            return { content: [{ type: "text", text: "File server.log chua duoc tao. He thong chua co loi nao hoac chua ghi log." }] };
        }
        const logs = fs.readFileSync(logPath, "utf-8");
        const logLines = logs.trim().split("\n");
        const lastLines = logLines.slice(-Math.abs(linesToRead)).join("\n");
        
        return { content: [{ type: "text", text: `--- [CUOI FILE LOG (${linesToRead} dong)] ---\n${lastLines}` }] };
    }
}
