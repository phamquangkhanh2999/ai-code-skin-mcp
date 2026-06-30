import { ToolHandler } from "./ToolHandler.js";
import { Logger } from "../utils/logger.js";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import util from "util";
import { z } from "zod";

const execPromise = util.promisify(exec);

export class RebuildServerTool implements ToolHandler {
    name = "rebuild_mcp_server";
    description = "Build lai ma nguon cua MCP Server tu xa. Hay goi neu ban hoac AI sua code cua hang nay.";
    inputSchema = { type: "object", properties: {} };

    async execute(args: any) {
        Logger.info("Dang thuc hien rebuild MCP Server...");
        try {
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const serverRoot = path.resolve(__dirname, "../../");
            Logger.info(`Server Root resolved: ${serverRoot}`);
            const { stdout, stderr } = await execPromise("npm run build", { cwd: serverRoot });
            const resText = `✅ Build MCP Server thanh cong.\n\n[STDOUT]:\n${stdout}\n\n[Luu y]: De ap dung code moi, ban hay yeu cau nguoi dung Reload MCP hoac an Ctrl + R nhe!`;
            Logger.info("Rebuild thanh cong.");
            return { content: [{ type: "text", text: resText }] };
        } catch (e: any) {
            Logger.error("Build failed", e);
            return { content: [{ type: "text", text: `❌ Build MCP That Bai:\n${e.message}\n${e.stdout}\n${e.stderr}` }], isError: true };
        }
    }
}
