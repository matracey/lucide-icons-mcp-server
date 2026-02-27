import { PACKAGES, LUCIDE_ICONS_BASE } from './constants.js'

import type { CodeExample, LucideIcon, LucidePackage, SearchResult } from './types.js'

function kebabToPascal(kebab: string): string {
  return kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function generateCodeExample(icon: LucideIcon, pkg: LucidePackage): CodeExample {
  const pascal = kebabToPascal(icon.slug)
  let code: string

  switch (pkg.id) {
    case 'lucide':
      code = `import { createIcons, ${pascal} } from 'lucide'

createIcons({
  icons: { ${pascal} }
})

// In HTML:
// <i data-lucide="${icon.slug}"></i>`
      break

    case 'lucide-react':
      code = `import { ${pascal} } from 'lucide-react'

const App = () => (
  <${pascal} size={24} color="currentColor" strokeWidth={2} />
)`
      break

    case 'lucide-vue-next':
      code = `<script setup>
import { ${pascal} } from 'lucide-vue-next'
</script>

<template>
  <${pascal} :size="24" color="currentColor" :stroke-width="2" />
</template>`
      break

    case 'lucide-angular':
      code = `// In your module:
import { LucideAngularModule, ${pascal} } from 'lucide-angular'

@NgModule({
  imports: [LucideAngularModule.pick({ ${pascal} })]
})

// In template:
// <i-lucide name="${icon.slug}" [size]="24"></i-lucide>`
      break

    case 'lucide-svelte':
      code = `<script>
  import { ${pascal} } from '@lucide/svelte'
</script>

<${pascal} size={24} color="currentColor" strokeWidth={2} />`
      break

    case 'lucide-svelte-4':
      code = `<script>
  import { ${pascal} } from 'lucide-svelte'
</script>

<${pascal} size={24} color="currentColor" strokeWidth={2} />`
      break

    case 'lucide-solid':
      code = `import { ${pascal} } from 'lucide-solid'

const App = () => (
  <${pascal} size={24} color="currentColor" strokeWidth={2} />
)`
      break

    case 'lucide-preact':
      code = `import { ${pascal} } from 'lucide-preact'

const App = () => (
  <${pascal} size={24} color="currentColor" stroke-width={2} />
)`
      break

    case 'lucide-react-native':
      code = `import { ${pascal} } from 'lucide-react-native'

const App = () => (
  <${pascal} size={24} color="currentColor" strokeWidth={2} />
)`
      break

    case 'lucide-static':
      code = `<!-- As an image -->
<img src="https://unpkg.com/lucide-static@latest/icons/${icon.slug}.svg" alt="${icon.name}" />

<!-- As CSS background -->
<style>
.icon-${icon.slug} {
  background-image: url('https://unpkg.com/lucide-static@latest/icons/${icon.slug}.svg');
  width: 24px;
  height: 24px;
}
</style>`
      break

    case 'lucide-astro':
      code = `---
import { ${pascal} } from '@lucide/astro'
---

<${pascal} size={24} color="currentColor" stroke-width={2} />`
      break

    default:
      code = `import { ${pascal} } from '${pkg.npmPackage}'`
  }

  return {
    packageId: pkg.id,
    packageName: pkg.name,
    framework: pkg.framework,
    installCmd: pkg.installCmd,
    code,
    language: pkg.codeLanguage,
  }
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No icons found matching your query.'
  }

  const lines = [`Found ${results.length} icon(s):`, '']

  for (const result of results) {
    lines.push(`### ${result.icon.name} (\`${result.icon.slug}\`) — score: ${result.score}`)
    lines.push('')
    lines.push(`**Categories:** ${result.icon.categories.join(', ')}`)
    lines.push(
      `**Tags:** ${result.icon.tags.slice(0, 5).join(', ')}${result.icon.tags.length > 5 ? '...' : ''}`
    )
    lines.push(`**Matched on:** ${result.matchedOn.join(', ')}`)
    lines.push(`**Docs:** ${LUCIDE_ICONS_BASE}/${result.icon.slug}`)
    lines.push('')
  }

  return lines.join('\n')
}

export function formatIconFull(icon: LucideIcon): string {
  const lines = [
    `# ${icon.name}`,
    '',
    `- **Slug:** \`${icon.slug}\``,
    `- **Categories:** ${icon.categories.join(', ')}`,
    `- **Tags:** ${icon.tags.join(', ')}`,
    `- **Docs:** ${LUCIDE_ICONS_BASE}/${icon.slug}`,
    '',
    '## SVG',
    '',
    '```svg',
    icon.svgContent.trim(),
    '```',
    '',
    '## Common Props',
    '',
    '| Prop | Type | Default |',
    '|------|------|---------|',
    '| `size` | `number` | `24` |',
    '| `color` | `string` | `currentColor` |',
    '| `strokeWidth` | `number` | `2` |',
    '| `absoluteStrokeWidth` | `boolean` | `false` |',
  ]

  return lines.join('\n')
}

export function formatCodeExamples(icon: LucideIcon, packageId?: string): string {
  let packages = PACKAGES
  if (packageId) {
    packages = packages.filter((p) => p.id === packageId)
    if (packages.length === 0) {
      return `Unknown package "${packageId}". Use lucide_get_package_info to see available packages.`
    }
  }

  const lines = [`# Code Examples for ${icon.name} (\`${icon.slug}\`)`, '']

  for (const pkg of packages) {
    const example = generateCodeExample(icon, pkg)
    lines.push(`## ${pkg.name} (${pkg.framework})`)
    lines.push('')
    lines.push(`Install: \`${pkg.installCmd}\``)
    lines.push('')
    lines.push(`\`\`\`${example.language}`)
    lines.push(example.code)
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n')
}

export function formatIconList(icons: LucideIcon[]): string {
  if (icons.length === 0) {
    return 'No icons found.'
  }

  const lines = [`${icons.length} icon(s):`, '']

  for (const icon of icons) {
    lines.push(`- **${icon.name}** (\`${icon.slug}\`) — ${icon.categories.join(', ')}`)
  }

  return lines.join('\n')
}

export function formatCategoryList(categories: string[]): string {
  if (categories.length === 0) {
    return 'No categories found.'
  }

  const lines = [`${categories.length} categories:`, '']
  for (const cat of categories) {
    lines.push(`- ${cat}`)
  }

  return lines.join('\n')
}

export function formatPackageInfo(pkg: LucidePackage): string {
  const lines = [
    `# ${pkg.name}`,
    '',
    `- **Framework:** ${pkg.framework}`,
    `- **npm:** \`${pkg.npmPackage}\``,
    `- **Install:** \`${pkg.installCmd}\``,
    `- **Docs:** ${pkg.docsUrl}`,
    '',
    '## Common Props',
    '',
    '| Prop | Type | Default |',
    '|------|------|---------|',
    '| `size` | `number` | `24` |',
    '| `color` | `string` | `currentColor` |',
    '| `strokeWidth` | `number` | `2` |',
    '| `absoluteStrokeWidth` | `boolean` | `false` |',
    '',
    'All icons also accept standard SVG presentation attributes.',
    '',
    `For full documentation, see: ${pkg.docsUrl}`,
  ]

  return lines.join('\n')
}
