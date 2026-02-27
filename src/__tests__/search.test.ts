import { describe, it, expect } from 'vitest'

import { searchIcons, findIcon, listIcons, listCategories } from '../search.js'

describe('searchIcons', () => {
  it('should return results for a valid query', () => {
    const results = searchIcons('camera')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].icon.name).toBe('Camera')
  })

  it('should return empty for nonsense query', () => {
    const results = searchIcons('xyznonexistent12345')
    expect(results).toHaveLength(0)
  })

  it('should return empty for empty query', () => {
    const results = searchIcons('')
    expect(results).toHaveLength(0)
  })

  it('should respect limit parameter', () => {
    const results = searchIcons('arrow', { limit: 3 })
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('should filter by category', () => {
    const results = searchIcons('arrow', { category: 'arrows' })
    expect(results.length).toBeGreaterThan(0)
    for (const result of results) {
      expect(result.icon.categories).toContain('arrows')
    }
  })

  it('should score exact matches higher', () => {
    const results = searchIcons('camera')
    const exactMatch = results.find((r) => r.icon.slug === 'camera')
    expect(exactMatch).toBeDefined()
    expect(exactMatch!.score).toBeGreaterThanOrEqual(100)
  })

  it('should match on tags', () => {
    const results = searchIcons('photography')
    expect(results.length).toBeGreaterThan(0)
    const hasTagMatch = results.some((r) => r.matchedOn.includes('tags'))
    expect(hasTagMatch).toBe(true)
  })

  it('should match on categories', () => {
    const results = searchIcons('medical')
    expect(results.length).toBeGreaterThan(0)
    const hasCategoryMatch = results.some((r) => r.matchedOn.includes('categories'))
    expect(hasCategoryMatch).toBe(true)
  })

  it('should match by kebab-case slug', () => {
    const results = searchIcons('arrow-down')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].icon.slug).toBe('arrow-down')
  })
})

describe('findIcon', () => {
  it('should find by PascalCase name', () => {
    const icon = findIcon('Camera')
    expect(icon).toBeDefined()
    expect(icon!.name).toBe('Camera')
  })

  it('should find by kebab-case slug', () => {
    const icon = findIcon('arrow-down')
    expect(icon).toBeDefined()
    expect(icon!.slug).toBe('arrow-down')
  })

  it('should be case-insensitive', () => {
    const icon = findIcon('CAMERA')
    expect(icon).toBeDefined()
    expect(icon!.name).toBe('Camera')
  })

  it('should return undefined for unknown icon', () => {
    const icon = findIcon('nonexistent-icon')
    expect(icon).toBeUndefined()
  })
})

describe('listIcons', () => {
  it('should return all icons without filter', () => {
    const result = listIcons()
    expect(result.length).toBeGreaterThan(100)
  })

  it('should filter by category', () => {
    const result = listIcons('arrows')
    expect(result.length).toBeGreaterThan(0)
    for (const icon of result) {
      expect(icon.categories).toContain('arrows')
    }
  })

  it('should return empty array for nonexistent category', () => {
    const result = listIcons('nonexistent')
    expect(result).toHaveLength(0)
  })
})

describe('listCategories', () => {
  it('should return a non-empty list of categories', () => {
    const categories = listCategories()
    expect(categories.length).toBeGreaterThan(0)
  })

  it('should return sorted categories', () => {
    const categories = listCategories()
    const sorted = [...categories].sort()
    expect(categories).toEqual(sorted)
  })

  it('should include known categories', () => {
    const categories = listCategories()
    expect(categories).toContain('arrows')
    expect(categories).toContain('medical')
    expect(categories).toContain('devices')
  })
})
