import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import type { LucideIcon } from '../src/types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_BASE = 'https://lucide.dev/api'
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons'

function log(msg: string): void {
  process.stderr.write(`[generate] ${msg}\n`)
}

function kebabToPascal(kebab: string): string {
  return kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

async function fetchJson<T>(url: string): Promise<T> {
  log(`Fetching ${url}...`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`)
  }
  return response.json() as Promise<T>
}

async function fetchSvgBatch(
  iconNames: string[],
  batchSize: number = 50
): Promise<Map<string, string>> {
  const svgMap = new Map<string, string>()

  for (let i = 0; i < iconNames.length; i += batchSize) {
    const batch = iconNames.slice(i, i + batchSize)
    log(
      `Fetching SVGs ${i + 1}-${Math.min(i + batchSize, iconNames.length)} of ${iconNames.length}...`
    )

    const results = await Promise.allSettled(
      batch.map(async (name) => {
        const url = `${GITHUB_RAW_BASE}/${name}.svg`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const text = await response.text()
        return { name, text }
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        svgMap.set(result.value.name, result.value.text)
      }
    }
  }

  return svgMap
}

async function main() {
  const outputDir = path.join(__dirname, '..', 'src', 'data', 'generated')

  log('Starting Lucide Icons knowledge base generation...')

  // Fetch all API data in parallel
  const [categoriesData, tagsData] = await Promise.all([
    fetchJson<Record<string, string[]>>(`${API_BASE}/categories`),
    fetchJson<Record<string, string[]>>(`${API_BASE}/tags`),
  ])

  const iconNames = Object.keys(categoriesData).sort()
  log(`Found ${iconNames.length} icons`)

  // Fetch SVG content
  const svgMap = await fetchSvgBatch(iconNames)
  log(`Retrieved ${svgMap.size} SVGs`)

  // Build icon objects
  const icons: LucideIcon[] = iconNames.map((name) => ({
    name: kebabToPascal(name),
    slug: name,
    categories: categoriesData[name] ?? [],
    tags: tagsData[name] ?? [],
    svgContent: svgMap.get(name) ?? '',
  }))

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true })

  // Write icons.json
  const jsonPath = path.join(outputDir, 'icons.json')
  fs.writeFileSync(jsonPath, JSON.stringify(icons, null, 2) + '\n')
  log(`Wrote ${icons.length} icons to ${jsonPath}`)

  // Write index.ts barrel
  const indexPath = path.join(outputDir, 'index.ts')
  const indexContent = `import type { LucideIcon } from '../../types.js'
import data from './icons.json' with { type: 'json' }

export const icons: LucideIcon[] = data as LucideIcon[]
`
  fs.writeFileSync(indexPath, indexContent)
  log(`Wrote ${indexPath}`)

  // Write .lucide-version
  const rootDir = path.join(__dirname, '..')
  try {
    const versionResponse = await fetch('https://registry.npmjs.org/lucide/latest')
    if (versionResponse.ok) {
      const versionData = (await versionResponse.json()) as { version: string }
      const versionFilePath = path.join(rootDir, '.lucide-version')
      fs.writeFileSync(versionFilePath, versionData.version + '\n')
      log(`Wrote Lucide version ${versionData.version} to .lucide-version`)
    }
  } catch (error) {
    log(`Warning: could not fetch Lucide version from npm: ${error}`)
  }

  // Collect unique categories
  const uniqueCategories = new Set<string>()
  for (const icon of icons) {
    for (const cat of icon.categories) {
      uniqueCategories.add(cat)
    }
  }
  log(`Categories found: ${[...uniqueCategories].sort().join(', ')}`)

  log('Done!')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
