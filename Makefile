setup:
	@echo "Setting up project..."
	@deno add npm:@anthropic-ai/sdk@^0.70.1 >/dev/null
	@deno add jsr:@corespeed/zypher@^0.5.1 >/dev/null
	@deno add npm:firecrawl-mcp@^3.6.2 >/dev/null
	@deno add npm:rxjs-for-await@^1.0.0 >/dev/null
	@deno add npm:zod@^4.1.12 >/dev/null
	@echo "Installing frontend dependencies..."
	@cd ui && npm install
	@echo "Setup complete!"

dev:
	@echo "Starting backend + frontend..."
	@deno task dev