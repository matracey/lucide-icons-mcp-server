import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { SERVER_NAME, SERVER_VERSION, CATEGORIES, PACKAGES } from './constants.js'
import {
  formatSearchResults,
  formatIconFull,
  formatCodeExamples,
  formatIconList,
  formatCategoryList,
  formatPackageInfo,
} from './formatters.js'
import { searchIcons, findIcon, listIcons, listCategories } from './search.js'

export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  })

  server.tool(
    'lucide_search',
    'Search Lucide icons by name, tags, or category. Returns matching icons with scores and metadata.',
    {
      query: z.string().describe('Search query (icon name, tag, or keyword)'),
      category: z.enum(CATEGORIES).optional().describe('Filter by icon category'),
      limit: z
        .number()
        .min(1)
        .max(20)
        .optional()
        .default(10)
        .describe('Maximum number of results (1-20, default 10)'),
    },
    async ({ query, category, limit }) => {
      const results = searchIcons(query, { category, limit })
      return {
        content: [{ type: 'text' as const, text: formatSearchResults(results) }],
      }
    }
  )

  server.tool(
    'lucide_get_icon',
    'Get full documentation for a specific Lucide icon including SVG content, categories, tags, and common props.',
    {
      name: z
        .string()
        .describe('Icon name in PascalCase (e.g. "ArrowDown") or kebab-case (e.g. "arrow-down")'),
    },
    async ({ name }) => {
      const icon = findIcon(name)
      if (!icon) {
        const results = searchIcons(name, { limit: 3 })
        const suggestions =
          results.length > 0
            ? `\n\nDid you mean: ${results.map((r) => `${r.icon.name} (${r.icon.slug})`).join(', ')}?`
            : ''
        return {
          content: [
            {
              type: 'text' as const,
              text: `Icon "${name}" not found.${suggestions}`,
            },
          ],
          isError: true,
        }
      }
      return {
        content: [{ type: 'text' as const, text: formatIconFull(icon) }],
      }
    }
  )

  server.tool(
    'lucide_get_examples',
    'Get code examples for a Lucide icon across framework packages (React, Vue, Angular, Svelte, etc.).',
    {
      name: z.string().describe('Icon name in PascalCase or kebab-case'),
      package: z
        .string()
        .optional()
        .describe(
          'Filter to a specific package ID (e.g. "lucide-react", "lucide-vue-next"). Omit for all packages.'
        ),
    },
    async ({ name, package: packageId }) => {
      const icon = findIcon(name)
      if (!icon) {
        return {
          content: [{ type: 'text' as const, text: `Icon "${name}" not found.` }],
          isError: true,
        }
      }
      return {
        content: [{ type: 'text' as const, text: formatCodeExamples(icon, packageId) }],
      }
    }
  )

  server.tool(
    'lucide_list_icons',
    'List all available Lucide icons, optionally filtered by category.',
    {
      category: z.enum(CATEGORIES).optional().describe('Filter by icon category'),
    },
    async ({ category }) => {
      const result = listIcons(category)
      return {
        content: [{ type: 'text' as const, text: formatIconList(result) }],
      }
    }
  )

  server.tool(
    'lucide_list_categories',
    'List all available Lucide icon categories.',
    {},
    async () => {
      const categories = listCategories()
      return {
        content: [{ type: 'text' as const, text: formatCategoryList(categories) }],
      }
    }
  )

  server.tool(
    'lucide_get_package_info',
    'Get installation and usage information for a specific Lucide package (e.g. lucide-react, lucide-vue-next).',
    {
      package: z
        .string()
        .describe(
          'Package ID (e.g. "lucide-react", "lucide-vue-next", "lucide-angular", "lucide-svelte")'
        ),
    },
    async ({ package: packageId }) => {
      const pkg = PACKAGES.find((p) => p.id === packageId)
      if (!pkg) {
        const available = PACKAGES.map((p) => p.id).join(', ')
        return {
          content: [
            {
              type: 'text' as const,
              text: `Package "${packageId}" not found.\n\nAvailable packages: ${available}`,
            },
          ],
          isError: true,
        }
      }
      return {
        content: [{ type: 'text' as const, text: formatPackageInfo(pkg) }],
      }
    }
  )

  return server
}
