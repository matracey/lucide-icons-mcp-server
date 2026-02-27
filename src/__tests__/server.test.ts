import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { describe, it, expect, beforeAll } from 'vitest'

import { SERVER_NAME, SERVER_VERSION } from '../constants.js'
import { createServer } from '../server.js'

describe('createServer', () => {
  it('should return an McpServer instance', () => {
    const server = createServer()
    expect(server).toBeDefined()
    expect(server.server).toBeDefined()
  })
})

describe('MCP Server integration', () => {
  let client: Client

  beforeAll(async () => {
    const server = createServer()
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    await server.connect(serverTransport)
    client = new Client({ name: 'test-client', version: '1.0.0' })
    await client.connect(clientTransport)
  })

  it('should report correct server info', async () => {
    const info = client.getServerVersion()
    expect(info?.name).toBe(SERVER_NAME)
    expect(info?.version).toBe(SERVER_VERSION)
  })

  it('should list all 6 tools', async () => {
    const result = await client.listTools()
    const toolNames = result.tools.map((t) => t.name)
    expect(toolNames).toContain('lucide_search')
    expect(toolNames).toContain('lucide_get_icon')
    expect(toolNames).toContain('lucide_get_examples')
    expect(toolNames).toContain('lucide_list_icons')
    expect(toolNames).toContain('lucide_list_categories')
    expect(toolNames).toContain('lucide_get_package_info')
    expect(result.tools).toHaveLength(6)
  })

  describe('lucide_search', () => {
    it('should return results for a valid query', async () => {
      const result = await client.callTool({
        name: 'lucide_search',
        arguments: { query: 'camera' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('Camera')
    })

    it('should return no results for nonsense query', async () => {
      const result = await client.callTool({
        name: 'lucide_search',
        arguments: { query: 'xyznonexistent12345' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('No icons found')
    })

    it('should filter by category', async () => {
      const result = await client.callTool({
        name: 'lucide_search',
        arguments: { query: 'arrow', category: 'arrows' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('Arrow')
    })
  })

  describe('lucide_get_icon', () => {
    it('should return full icon info', async () => {
      const result = await client.callTool({
        name: 'lucide_get_icon',
        arguments: { name: 'Camera' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('# Camera')
      expect(text).toContain('SVG')
      expect(text).toContain('Common Props')
    })

    it('should find by kebab-case slug', async () => {
      const result = await client.callTool({
        name: 'lucide_get_icon',
        arguments: { name: 'arrow-down' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('ArrowDown')
    })

    it('should return error for unknown icon', async () => {
      const result = await client.callTool({
        name: 'lucide_get_icon',
        arguments: { name: 'NonExistentIcon' },
      })
      expect(result.isError).toBe(true)
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('not found')
    })

    it('should suggest similar names for unknown icon', async () => {
      const result = await client.callTool({
        name: 'lucide_get_icon',
        arguments: { name: 'cam' },
      })
      expect(result.isError).toBe(true)
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('Did you mean')
    })
  })

  describe('lucide_get_examples', () => {
    it('should return examples for all packages', async () => {
      const result = await client.callTool({
        name: 'lucide_get_examples',
        arguments: { name: 'Camera' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('Lucide React')
      expect(text).toContain('Lucide Vue Next')
    })

    it('should filter by package', async () => {
      const result = await client.callTool({
        name: 'lucide_get_examples',
        arguments: { name: 'Camera', package: 'lucide-react' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('Lucide React')
      expect(text).not.toContain('Lucide Vue Next')
    })

    it('should return error for unknown icon', async () => {
      const result = await client.callTool({
        name: 'lucide_get_examples',
        arguments: { name: 'FakeIcon' },
      })
      expect(result.isError).toBe(true)
    })
  })

  describe('lucide_list_icons', () => {
    it('should list all icons', async () => {
      const result = await client.callTool({
        name: 'lucide_list_icons',
        arguments: {},
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('icon(s)')
    })

    it('should filter by category', async () => {
      const result = await client.callTool({
        name: 'lucide_list_icons',
        arguments: { category: 'arrows' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('Arrow')
    })
  })

  describe('lucide_list_categories', () => {
    it('should return categories', async () => {
      const result = await client.callTool({
        name: 'lucide_list_categories',
        arguments: {},
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('categories')
      expect(text).toContain('arrows')
      expect(text).toContain('medical')
    })
  })

  describe('lucide_get_package_info', () => {
    it('should return package info', async () => {
      const result = await client.callTool({
        name: 'lucide_get_package_info',
        arguments: { package: 'lucide-react' },
      })
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('Lucide React')
      expect(text).toContain('npm install lucide-react')
    })

    it('should return error for unknown package', async () => {
      const result = await client.callTool({
        name: 'lucide_get_package_info',
        arguments: { package: 'nonexistent' },
      })
      expect(result.isError).toBe(true)
      const text = (result.content as Array<{ type: string; text: string }>)[0].text
      expect(text).toContain('not found')
      expect(text).toContain('Available packages')
    })
  })
})
