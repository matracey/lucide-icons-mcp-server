import { MAX_SEARCH_RESULTS } from './constants.js'
import { icons } from './data/generated/index.js'

import type { LucideIcon, SearchResult } from './types.js'

export function searchIcons(
  query: string,
  options?: { category?: string; limit?: number }
): SearchResult[] {
  const limit = options?.limit ?? 10
  const categoryFilter = options?.category

  const queryLower = query.toLowerCase().trim()
  if (!queryLower) return []

  const tokens = queryLower.split(/\s+/).filter((t) => t.length > 0)

  let filtered = icons
  if (categoryFilter) {
    filtered = filtered.filter((icon) => icon.categories.includes(categoryFilter))
  }

  const results: SearchResult[] = []

  for (const icon of filtered) {
    let score = 0
    const matchedOn = new Set<'name' | 'tags' | 'categories'>()
    const nameLower = icon.name.toLowerCase()
    const slugLower = icon.slug

    // Exact name or slug match
    if (nameLower === queryLower || slugLower === queryLower) {
      score += 100
      matchedOn.add('name')
    }
    // Name/slug contains full query
    else if (nameLower.includes(queryLower) || slugLower.includes(queryLower)) {
      score += 50
      matchedOn.add('name')
    }

    // Name/slug contains any token
    for (const token of tokens) {
      if ((nameLower.includes(token) || slugLower.includes(token)) && !matchedOn.has('name')) {
        score += 30
        matchedOn.add('name')
      }
    }

    // Tag matching
    for (const tag of icon.tags) {
      const tagLower = tag.toLowerCase()
      for (const token of tokens) {
        if (tagLower === token) {
          score += 20
          matchedOn.add('tags')
          break
        }
        if (tagLower.includes(token)) {
          score += 10
          matchedOn.add('tags')
          break
        }
      }
      if (matchedOn.has('tags')) break
    }

    // Category matching
    for (const cat of icon.categories) {
      const catLower = cat.toLowerCase()
      for (const token of tokens) {
        if (catLower === token || catLower.includes(token)) {
          score += 15
          matchedOn.add('categories')
          break
        }
      }
      if (matchedOn.has('categories')) break
    }

    if (score > 0) {
      results.push({
        icon,
        score,
        matchedOn: Array.from(matchedOn),
      })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, Math.min(limit, MAX_SEARCH_RESULTS))
}

export function findIcon(name: string): LucideIcon | undefined {
  const nameLower = name.toLowerCase()
  return icons.find((icon) => icon.name.toLowerCase() === nameLower || icon.slug === nameLower)
}

export function listIcons(category?: string): LucideIcon[] {
  if (category) {
    return icons.filter((icon) => icon.categories.includes(category))
  }
  return [...icons]
}

export function listCategories(): string[] {
  const categories = new Set<string>()
  for (const icon of icons) {
    for (const cat of icon.categories) {
      categories.add(cat)
    }
  }
  return Array.from(categories).sort()
}
