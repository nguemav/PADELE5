/**
 * @file mcp-config.js
 * This file contains the configuration for a potential MCP (Media Control Protocol) server.
 * While the application is client-side only, this configuration is stored here for future use
 * or to inform client-side behavior. It also surfaces tweakable values for easy adjustment.
 */

/* @tweakable Configure if the MCP features are enabled client-side. */
const mcpEnabled = false;

/* @tweakable Configuration for the MCP server transport layer. */
const mcpTransportOptions = {
    /* @tweakable The port the MCP server is expected to run on. */
    port: 8080,
    /* @tweakable The HTTP endpoint path for MCP requests. */
    endpoint: "/mcp",
    /* @tweakable The response mode, 'batch' or 'stream'. */
    responseMode: "batch",
    /* @tweakable Maximum message size for MCP communication. */
    maxMessageSize: "4mb",
    /* @tweakable Timeout for batch responses in milliseconds. */
    batchTimeout: 30000,
};

/* @tweakable Configuration for Cross-Origin Resource Sharing (CORS). */
const corsConfig = {
    allowOrigin: "*",
    allowMethods: "GET, POST, DELETE, OPTIONS",
    allowHeaders: "Content-Type, Accept, Authorization, x-api-key, Mcp-Session-Id, Last-Event-ID",
    exposeHeaders: "Content-Type, Authorization, x-api-key, Mcp-Session-Id",
    maxAge: "86400"
};

/* @tweakable Session management configuration. */
const sessionConfig = {
    /* @tweakable Enable or disable session management. */
    enabled: true,
    /* @tweakable The header name for the session ID. */
    headerName: "Mcp-Session-Id",
    /* @tweakable Allow clients to terminate their own sessions. */
    allowClientTermination: true
};

/* @tweakable Stream resumability configuration. */
const resumabilityConfig = {
    /* @tweakable Enable or disable stream resumability. */
    enabled: false,
    /* @tweakable Duration to keep message history in milliseconds (e.g., for rejoining a stream). */
    historyDuration: 300000
};


/**
 * The complete MCP server configuration object.
 */
export const mcpConfig = {
  enabled: mcpEnabled,
  transport: {
    type: "http-stream",
    options: {
      ...mcpTransportOptions,
      headers: {
        "X-Custom-Header": "value"
      },
      cors: corsConfig,
      auth: {
        // Auth provider would be defined elsewhere, e.g., an imported module.
        // For now, it's a placeholder.
        provider: null
      },
      session: sessionConfig,
      resumability: resumabilityConfig,
    }
  }
};

/**
 * Initializes any client-side logic related to MCP.
 * For now, this function is a placeholder and will log the configuration if enabled.
 */
export function initializeMcpClient() {
    if (mcpConfig.enabled) {
        console.log("MCP Client features enabled. Awaiting connection to server...");
        console.log("Configuration:", mcpConfig);
        // In the future, client-side connection logic would go here.
        // For example: connectToServer(mcpConfig.transport.options);
    } else {
        console.log("MCP Client features are disabled.");
    }
}