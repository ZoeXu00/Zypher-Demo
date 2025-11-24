import {
  AnthropicModelProvider,
  createZypherContext,
  ZypherAgent,
} from "@corespeed/zypher";
import { eachValueFrom } from "npm:rxjs-for-await";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Helper: safely get environment variables
function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

// Initialize the agent execution context
const zypherContext = await createZypherContext(Deno.cwd());

// Create the agent with your preferred LLM provider
const agent = new ZypherAgent(
  zypherContext,
  new AnthropicModelProvider({
    apiKey: getRequiredEnv("ANTHROPIC_API_KEY"),
  })
);

// Register and connect to an MCP server to give the agent web crawling capabilities
await agent.mcp.registerServer({
  id: "firecrawl",
  type: "command",
  command: {
    command: "npx",
    args: ["-y", "firecrawl-mcp"],
    env: {
      FIRECRAWL_API_KEY: getRequiredEnv("FIRECRAWL_API_KEY"),
    },
  },
});

await agent.mcp.registerServer({
  id: "python",
  type: "command",
  command: {
    command: "python3",
    args: ["-m", "mcp_python"],
  },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// HTTP request handler
const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method === "POST" && url.pathname === "/chat") {
    try {
      const body = await req.json();
      const userMessage = String(body.message ?? "").trim();

      if (!userMessage) {
        return new Response(
          JSON.stringify({ error: "Missing 'message' in body" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const task = agent.runTask(userMessage, "claude-sonnet-4-20250514");

      // --- STREAMING RESPONSE (SSE) ---
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      (async () => {
        try {
          for await (const event of eachValueFrom(task)) {
            const eventJson = JSON.stringify(event);
            await writer.write(encoder.encode(`data: ${eventJson}\n\n`));
          }

          // Notify frontend the stream has ended
          await writer.write(encoder.encode("event: end\n\n"));
        } catch (error) {
          console.error("Error during agent task streaming:", error);
          const errorEvent = JSON.stringify({
            type: "error",
            content: "A streaming error occurred on the server.",
          });
          await writer.write(encoder.encode(`data: ${errorEvent}\n\n`));
        } finally {
          writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
      // --- END STREAMING RESPONSE ---
    } catch (err) {
      console.error("Error handling /chat:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Not found", { status: 404 });
};

// Start HTTP server
console.log("Zypher agent HTTP server running at http://localhost:8000");
serve(handler, { port: 8000 });
