import { describe, it, expect } from 'vitest'
import { splitTextIntoChunks, formatLanguageToLocalCode } from '@/utils/helper'

describe('Helper Utilities', () => {
  describe('splitTextIntoChunks', () => {
    it('should split text into chunks of specified length', () => {
      const text = 'This is a test sentence that should be split into multiple chunks for processing.'
      const chunks = splitTextIntoChunks(text, 10)
      expect(chunks.length).toBeGreaterThan(1)
      expect(chunks[0].length).toBeLessThanOrEqual(15) // Tolerance for word boundaries
    })

    it('should handle empty text', () => {
      const chunks = splitTextIntoChunks('', 10)
      expect(chunks).toEqual([])
    })
  })

  describe('formatLanguageToLocalCode', () => {
    it('should return correct local code for known languages', () => {
      expect(formatLanguageToLocalCode('English')).toBe('en-US')
      expect(formatLanguageToLocalCode('French')).toBe('fr-FR')
      expect(formatLanguageToLocalCode('Spanish')).toBe('es-ES')
    })

    it('should return default code for unknown languages', () => {
      expect(formatLanguageToLocalCode('Unknown')).toBe('en-US')
    })
  })
})
