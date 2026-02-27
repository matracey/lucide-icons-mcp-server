import { describe, it, expect } from 'vitest'

import { icons } from '../data/generated/index.js'

import type { LucideIcon } from '../types.js'

describe('Generated icon data', () => {
  it('should have a non-empty icons array', () => {
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should have icons with required fields', () => {
    for (const icon of icons.slice(0, 10)) {
      expect(icon.name).toBeDefined()
      expect(typeof icon.name).toBe('string')
      expect(icon.name.length).toBeGreaterThan(0)

      expect(icon.slug).toBeDefined()
      expect(typeof icon.slug).toBe('string')
      expect(icon.slug.length).toBeGreaterThan(0)

      expect(Array.isArray(icon.categories)).toBe(true)
      expect(icon.categories.length).toBeGreaterThan(0)

      expect(Array.isArray(icon.tags)).toBe(true)

      expect(typeof icon.svgContent).toBe('string')
      expect(icon.svgContent.length).toBeGreaterThan(0)
    }
  })

  it('should have PascalCase names', () => {
    for (const icon of icons.slice(0, 20)) {
      expect(icon.name[0]).toBe(icon.name[0].toUpperCase())
    }
  })

  it('should have kebab-case slugs', () => {
    for (const icon of icons.slice(0, 20)) {
      expect(icon.slug).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('should have valid SVG content', () => {
    for (const icon of icons.slice(0, 10)) {
      expect(icon.svgContent).toContain('<svg')
      expect(icon.svgContent).toContain('</svg>')
    }
  })

  it('should conform to LucideIcon interface', () => {
    const icon: LucideIcon = icons[0]
    expect(icon).toHaveProperty('name')
    expect(icon).toHaveProperty('slug')
    expect(icon).toHaveProperty('categories')
    expect(icon).toHaveProperty('tags')
    expect(icon).toHaveProperty('svgContent')
  })
})
