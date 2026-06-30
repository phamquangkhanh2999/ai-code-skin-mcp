import { ToolHandler } from "./ToolHandler.js";
import { RunFullAnalysisWorkflowTool } from "./RunFullAnalysisWorkflowTool.js";
import { FetchSmartContextTool } from "./FetchSmartContextTool.js";
import { ProjectSnapshotTool } from "./ProjectSnapshotTool.js";
import { ListCodeSnippetsTool } from "./ListCodeSnippetsTool.js";
import { SystemDiagnosticsTool } from "./SystemDiagnosticsTool.js";
import { ReadServerLogsTool } from "./ReadServerLogsTool.js";
import { RebuildServerTool } from "./RebuildServerTool.js";

export const tools: ToolHandler[] = [
    new RunFullAnalysisWorkflowTool(),
    new FetchSmartContextTool(),
    new ProjectSnapshotTool(),
    new ListCodeSnippetsTool(),
    new SystemDiagnosticsTool(),
    new ReadServerLogsTool(),
    new RebuildServerTool()
];
