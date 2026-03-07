import { describe, expect, it } from 'vitest'
import { parse, stringify } from '../../../src/core/env-parser.js'

describe('env-parser', () => {
  describe('parse', () => {
    it('should parse basic KEY=VALUE', () => {
      const result = parse('API_KEY=abc123\nDB_HOST=localhost')
      expect(result.get('API_KEY')).toBe('abc123')
      expect(result.get('DB_HOST')).toBe('localhost')
    })

    it('should skip comments', () => {
      const result = parse('# comment\nKEY=value')
      expect(result.size).toBe(1)
      expect(result.get('KEY')).toBe('value')
    })

    it('should skip empty lines', () => {
      const result = parse('KEY1=a\n\n\nKEY2=b')
      expect(result.size).toBe(2)
    })

    it('should handle double-quoted values', () => {
      const result = parse('KEY="hello world"')
      expect(result.get('KEY')).toBe('hello world')
    })

    it('should handle single-quoted values', () => {
      const result = parse("KEY='hello world'")
      expect(result.get('KEY')).toBe('hello world')
    })

    it('should handle empty values', () => {
      const result = parse('KEY=')
      expect(result.get('KEY')).toBe('')
    })

    it('should handle export prefix', () => {
      const result = parse('export KEY=value')
      expect(result.get('KEY')).toBe('value')
    })

    it('should handle values with = sign', () => {
      const result = parse('KEY=abc=def')
      expect(result.get('KEY')).toBe('abc=def')
    })
  })

  describe('stringify', () => {
    it('should stringify a map to env format', () => {
      const env = new Map([
        ['KEY', 'value'],
        ['OTHER', 'data'],
      ])
      const result = stringify(env)
      expect(result).toBe('KEY=value\nOTHER=data\n')
    })

    it('should quote values with spaces', () => {
      const env = new Map([['KEY', 'hello world']])
      const result = stringify(env)
      expect(result).toBe('KEY="hello world"\n')
    })
  })
})
