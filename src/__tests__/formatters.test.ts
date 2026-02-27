import { describe, it, expect } from 'vitest'

import { PACKAGES } from '../constants.js'
import {
  formatSearchResults,
  formatIconFull,
  formatCodeExamples,
  formatIconList,
  formatCategoryList,
  formatPackageInfo,
} from '../formatters.js'

import type { LucideIcon, SearchResult } from '../types.js'

const mockIcon: LucideIcon = {
  name: 'Camera',
  slug: 'camera',
  categories: ['photography', 'devices'],
  tags: ['photo', 'lens', 'capture'],
  svgContent:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="13" r="3" /></svg>',
}

const mockResults: SearchResult[] = [{ icon: mockIcon, score: 100, matchedOn: ['name'] }]

describe('formatSearchResults', () => {
  it('should format results with icon details', () => {
    const output = formatSearchResults(mockResults)
    expect(output).toContain('Found 1 icon(s)')
    expect(output).toContain('Camera')
    expect(output).toContain('camera')
    expect(output).toContain('score: 100')
    expect(output).toContain('photography')
  })

  it('should return message for empty results', () => {
    const output = formatSearchResults([])
    expect(output).toContain('No icons found')
  })
})

describe('formatIconFull', () => {
  it('should format full icon details', () => {
    const output = formatIconFull(mockIcon)
    expect(output).toContain('# Camera')
    expect(output).toContain('`camera`')
    expect(output).toContain('photography')
    expect(output).toContain('photo')
    expect(output).toContain('SVG')
    expect(output).toContain('<svg')
    expect(output).toContain('Common Props')
    expect(output).toContain('`size`')
    expect(output).toContain('`strokeWidth`')
  })
})

describe('formatCodeExamples', () => {
  it('should generate examples for all packages', () => {
    const output = formatCodeExamples(mockIcon)
    expect(output).toContain('# Code Examples for Camera')
    expect(output).toContain('Lucide React')
    expect(output).toContain('Lucide Vue Next')
    expect(output).toContain('Lucide Angular')
    expect(output).toContain('Lucide Svelte')
    expect(output).toContain('Lucide Solid')
    expect(output).toContain('Lucide Preact')
    expect(output).toContain('Lucide React Native')
    expect(output).toContain('Lucide Static')
    expect(output).toContain('Lucide Astro')
  })

  it('should filter by package ID', () => {
    const output = formatCodeExamples(mockIcon, 'lucide-react')
    expect(output).toContain('Lucide React')
    expect(output).not.toContain('Lucide Vue Next')
    expect(output).toContain("import { Camera } from 'lucide-react'")
  })

  it('should return error for unknown package', () => {
    const output = formatCodeExamples(mockIcon, 'nonexistent')
    expect(output).toContain('Unknown package')
  })

  it('should generate correct React example', () => {
    const output = formatCodeExamples(mockIcon, 'lucide-react')
    expect(output).toContain("import { Camera } from 'lucide-react'")
    expect(output).toContain('<Camera')
  })

  it('should generate correct Vue example', () => {
    const output = formatCodeExamples(mockIcon, 'lucide-vue-next')
    expect(output).toContain("import { Camera } from 'lucide-vue-next'")
    expect(output).toContain('<Camera')
    expect(output).toContain('<script setup>')
  })

  it('should generate correct vanilla JS example', () => {
    const output = formatCodeExamples(mockIcon, 'lucide')
    expect(output).toContain("import { createIcons, Camera } from 'lucide'")
    expect(output).toContain('data-lucide="camera"')
  })

  it('should generate correct Angular example', () => {
    const output = formatCodeExamples(mockIcon, 'lucide-angular')
    expect(output).toContain('LucideAngularModule')
    expect(output).toContain('i-lucide')
    expect(output).toContain('name="camera"')
  })

  it('should generate correct static example', () => {
    const output = formatCodeExamples(mockIcon, 'lucide-static')
    expect(output).toContain('unpkg.com')
    expect(output).toContain('camera.svg')
  })
})

describe('formatIconList', () => {
  it('should format a list of icons', () => {
    const output = formatIconList([mockIcon])
    expect(output).toContain('1 icon(s)')
    expect(output).toContain('Camera')
    expect(output).toContain('`camera`')
  })

  it('should return message for empty list', () => {
    const output = formatIconList([])
    expect(output).toContain('No icons found')
  })
})

describe('formatCategoryList', () => {
  it('should format a list of categories', () => {
    const output = formatCategoryList(['arrows', 'devices', 'medical'])
    expect(output).toContain('3 categories')
    expect(output).toContain('arrows')
    expect(output).toContain('devices')
    expect(output).toContain('medical')
  })

  it('should return message for empty list', () => {
    const output = formatCategoryList([])
    expect(output).toContain('No categories found')
  })
})

describe('formatPackageInfo', () => {
  it('should format package information', () => {
    const pkg = PACKAGES.find((p) => p.id === 'lucide-react')!
    const output = formatPackageInfo(pkg)
    expect(output).toContain('# Lucide React')
    expect(output).toContain('React')
    expect(output).toContain('lucide-react')
    expect(output).toContain('npm install')
    expect(output).toContain('Common Props')
    expect(output).toContain('`size`')
  })
})
