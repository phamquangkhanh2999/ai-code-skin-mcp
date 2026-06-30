import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { Logger } from "./utils/logger.js";
import { tools } from "./tools/index.js";

async function main() {
    Logger.info("🚀 [HE THONG] Tien trinh MCP Server da khoi dong. Dang ket noi voi IDE qua STDIO...");
    
    const server = new Server(
        { name: "khanh-scp-orchestrator", version: "2.0.0" },
        { capabilities: { tools: {} } }
    );

    // 1. Dang ky cac Tools tu dong (Command Pattern Auto-Register)
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: tools.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema
        }))
    }));

    // 2. Xu ly Logic Tools bang Router
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        try {
            const tool = tools.find(t => t.name === name);
            if (!tool) throw new Error(`Tool ${name} chua duoc ho tro`);

            return await tool.execute(args);

        } catch (error: any) {
            Logger.error(`Loi thuc thi tool [${name}]`, error);
            return {
                content: [{ type: "text", text: `LOI HE THONG [${name}]: ${error.message}\n(Hay mo file server.log de xem chi tiet dong loi va Stacktrace)` }],
                isError: true
            };
        }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => Logger.error("Loi khoi chay Server", error));
