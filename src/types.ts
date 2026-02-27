export interface LucideIcon {
  name: string
  slug: string
  categories: string[]
  tags: string[]
  svgContent: string
}

export interface LucidePackage {
  id: string
  name: string
  npmPackage: string
  framework: string
  docsUrl: string
  installCmd: string
  codeLanguage: 'jsx' | 'vue' | 'svelte' | 'astro' | 'html' | 'js' | 'ts'
}

export interface CodeExample {
  packageId: string
  packageName: string
  framework: string
  installCmd: string
  code: string
  language: string
}

export interface SearchResult {
  icon: LucideIcon
  score: number
  matchedOn: ('name' | 'tags' | 'categories')[]
}
