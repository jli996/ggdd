import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SearchTool } from './tools/search.ts';
import { RetrieveTool } from './tools/retrieve.ts';
import { getVersion } from '../lib/version.ts';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'ggdd',
    version: getVersion(import.meta.dirname),
  });

  server.tool(
    SearchTool.name,
    SearchTool.description,
    SearchTool.inputSchema.shape,
    SearchTool.handler,
  );

  server.tool(
    RetrieveTool.name,
    RetrieveTool.description,
    RetrieveTool.inputSchema.shape,
    RetrieveTool.handler,
  );

  return server;
}
