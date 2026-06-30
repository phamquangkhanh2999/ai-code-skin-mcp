import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

export interface ToolHandler {
    name: string;
    description: string;
    inputSchema: any;
    execute(args: any): Promise<any>;
}
