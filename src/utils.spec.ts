import { describe, it, expect } from 'vitest'
import { camelize } from './utils'

describe('camelize', () => {
  it('should camelize', () => {
    expect(camelize('FooService')).toBe('fooService')
  })
})
