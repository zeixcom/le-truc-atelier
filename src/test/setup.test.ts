import { describe, expect, it } from 'bun:test'

describe('jsdom test environment', () => {
	it('provides browser globals', () => {
		expect(typeof window).toBe('object')
		expect(document).toBeInstanceOf(Document)
		expect(customElements).toBeDefined()
		expect(new Event('input')).toBeInstanceOf(Event)
	})
})
