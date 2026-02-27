# Lucide Icons MCP Server

> MCP server for Lucide Icons — search docs, props, and code examples from any AI coding assistant

[![npm version](https://img.shields.io/npm/v/lucide-icons-mcp-server)](https://www.npmjs.com/package/lucide-icons-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/matracey/lucide-icons-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/matracey/lucide-icons-mcp-server/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

## Overview

**lucide-icons-mcp-server** is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that gives AI coding assistants instant access to [Lucide Icons](https://lucide.dev) documentation. It enables tools like GitHub Copilot, Claude, Cursor, and others to search icons, look up SVG content, and retrieve framework-specific code examples — all without leaving your editor.

[Lucide](https://lucide.dev) is a beautiful & consistent icon toolkit, forked from Feather Icons. With 1,700+ icons and packages for every major framework, it's one of the most popular open-source icon libraries.

```
┌─────────────────┐     ┌────────────┐     ┌─────────────────────────┐     ┌────────────────┐
│  AI Assistant    │────▶│ MCP Client │────▶│ lucide-icons-mcp-server │────▶│ Knowledge Base │
│ (Copilot/Claude) │◀────│            │◀────│                         │◀────│ (1,700+ icons) │
└─────────────────┘     └────────────┘     └─────────────────────────┘     └────────────────┘
```

## Available Tools

| Tool                      | Description                                  | Parameters                              |
| ------------------------- | -------------------------------------------- | --------------------------------------- |
| `lucide_search`           | Search icon documentation                    | `query` (required), `category`, `limit` |
| `lucide_get_icon`         | Get full icon docs with SVG & props          | `name` (required)                       |
| `lucide_get_examples`     | Get code examples for an icon                | `name` (required), `package`            |
| `lucide_list_icons`       | List all icons, optionally by category       | `category`                              |
| `lucide_list_categories`  | List all available icon categories           | —                                       |
| `lucide_get_package_info` | Get installation & usage guide for a package | `package` (required)                    |

### Categories

Icons are organized into: `accessibility`, `account`, `animals`, `arrows`, `brands`, `buildings`, `charts`, `communication`, `connectivity`, `cursors`, `design`, `development`, `devices`, `emoji`, `files`, `finance`, `food-beverage`, `gaming`, `home`, `layout`, `mail`, `math`, `medical`, `multimedia`, `nature`, `navigation`, `notifications`, `people`, `photography`, `science`, `seasons`, `security`, `shapes`, `shopping`, `social`, `sports`, `sustainability`, `text`, `time`, `tools`, `transportation`, `travel`, `weather`

## Supported Packages

| Package               | Framework    |
| --------------------- | ------------ |
| `lucide`              | Vanilla JS   |
| `lucide-react`        | React        |
| `lucide-vue-next`     | Vue 3        |
| `lucide-angular`      | Angular      |
| `@lucide/svelte`      | Svelte 5     |
| `lucide-svelte`       | Svelte 4     |
| `lucide-solid`        | SolidJS      |
| `lucide-preact`       | Preact       |
| `lucide-react-native` | React Native |
| `lucide-static`       | Static/CSS   |
| `@lucide/astro`       | Astro        |

## Quick Start

```bash
npx lucide-icons-mcp-server
```

## Configuration

### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "lucide-icons": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "lucide-icons-mcp-server"]
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lucide-icons": {
      "command": "npx",
      "args": ["-y", "lucide-icons-mcp-server"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "lucide-icons": {
      "command": "npx",
      "args": ["-y", "lucide-icons-mcp-server"]
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "lucide-icons": {
      "command": "npx",
      "args": ["-y", "lucide-icons-mcp-server"]
    }
  }
}
```

### Amazon Q Developer CLI

Add to `~/.aws/amazonq/mcp.json`:

```json
{
  "mcpServers": {
    "lucide-icons": {
      "command": "npx",
      "args": ["-y", "lucide-icons-mcp-server"]
    }
  }
}
```

### Zed

Add to `settings.json`:

```json
{
  "context_servers": {
    "lucide-icons": {
      "command": {
        "path": "npx",
        "args": ["-y", "lucide-icons-mcp-server"]
      }
    }
  }
}
```

### JetBrains IDEs (IntelliJ, WebStorm, etc.)

1. Go to **Settings → Tools → AI Assistant → MCP Servers**
2. Click **Add**
3. Set command to `npx` with arguments `["-y", "lucide-icons-mcp-server"]`

### Cline

Add to `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "lucide-icons": {
      "command": "npx",
      "args": ["-y", "lucide-icons-mcp-server"]
    }
  }
}
```

## Development

### Prerequisites

- Node.js >= 20
- npm

### Setup

```bash
git clone https://github.com/matracey/lucide-icons-mcp-server.git
cd lucide-icons-mcp-server
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

### Run Locally

```bash
npm run dev    # Watch mode with tsx
npm start      # Run built version
```

### Regenerate Knowledge Base

The knowledge base is generated from the [Lucide](https://lucide.dev) APIs and the [lucide-icons/lucide](https://github.com/lucide-icons/lucide) GitHub repository:

```bash
npm run generate
```

This fetches icon metadata from the Lucide APIs (`/api/categories`, `/api/tags`), downloads SVG content from GitHub, and outputs the result to `src/data/generated/`.

## How It Works

### Architecture

The server uses the [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) to expose 6 tools over stdio transport. When an AI assistant connects, it can call these tools to query a pre-built knowledge base of 1,700+ Lucide icons.

### Knowledge Base Generation

The `scripts/generate-knowledge-base.ts` script:

1. Fetches icon categories from `https://lucide.dev/api/categories`
2. Fetches icon tags from `https://lucide.dev/api/tags`
3. Downloads SVG content for each icon from the `lucide-icons/lucide` GitHub repo
4. Generates code examples for all 11 framework packages from templates
5. Outputs a structured JSON file (`src/data/generated/icons.json`)

### Search Scoring

The search engine uses a token-based scoring system:

| Match Type               | Score |
| ------------------------ | ----- |
| Exact name/slug match    | +100  |
| Name/slug contains query | +50   |
| Name/slug contains token | +30   |
| Tag exact match          | +20   |
| Tag contains token       | +10   |
| Category matches token   | +15   |

Results are sorted by score and returned up to the specified limit (default 10, max 20).

### Project Structure

```text
src/
├── index.ts          # Entry point — stdio transport setup
├── server.ts         # MCP server & tool definitions
├── types.ts          # TypeScript interfaces
├── constants.ts      # Package definitions, categories, URLs
├── search.ts         # Fuzzy search logic
├── formatters.ts     # Markdown output formatters
├── data/generated/   # Generated icon knowledge base
└── __tests__/        # Tests (vitest)
scripts/
└── generate-knowledge-base.ts  # Data generation script
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- [Open an issue](https://github.com/matracey/lucide-icons-mcp-server/issues) for bugs or feature requests
- Submit a pull request with your changes

## License

MIT — see [LICENSE](LICENSE) for details.
