// Wait for frontend to start
await new Promise((resolve) => setTimeout(resolve, 2000));

const url = "http://localhost:5173";

// Cross-platform "open browser"
const commands: Record<string, string[]> = {
  darwin: ["open", url], // macOS
  linux: ["xdg-open", url], // Linux
  windows: ["cmd", "/c", "start", url], // Windows
};

const os = Deno.build.os;
const cmd = commands[os];

if (cmd) {
  const p = Deno.run({ cmd });
  await p.status();
} else {
  console.log(`🌍 Visit ${url}`);
}

export {};
