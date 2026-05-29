import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SearchTool } from './tools/search.ts';
import { RetrieveTool } from './tools/retrieve.ts';
import { TagsTool } from './tools/tags.ts';
import { SearchByTagTool } from './tools/search-by-tag.ts';
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

  server.tool(
    TagsTool.name,
    TagsTool.description,
    TagsTool.inputSchema.shape,
    TagsTool.handler,
  );

  server.tool(
    SearchByTagTool.name,
    SearchByTagTool.description,
    SearchByTagTool.inputSchema.shape,
    SearchByTagTool.handler,
  );

  return server;
}
