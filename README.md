# Zypher-Demo

---

## Prerequisites

Before getting started, make sure you have:

### Deno 2.0+
Install here: https://deno.com/manual/getting_started/installation

### API Keys
Get an Anthropic API key ([here](https://console.anthropic.com/settings/keys)) and a Firecrawl API key ([here](https://www.firecrawl.dev/))

Create a `.env` file in the **project root** (same folder as `main.ts`) and add:
```<language>
ANTHROPIC_API_KEY=your_anthropic_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

## Setup

Install all backend + frontend dependencies with command:

```bash
make setup
```
This will automatically:

- Install backend dependencies using **Deno**
- Install frontend dependencies inside `ui` using **npm**
- Generate `deno.lock` and `node_modules` for reproducible development

## Start Development
Run both backend + frontend (and auto-launch UI) with:

```bash
make dev
```

This will:

- Start the backend
- Start the Vite React UI
- Automatically open the browser to the UI

You can now chat with the Zypher AI agent demo.

