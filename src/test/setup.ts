import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
	url: 'http://localhost:5173/',
	pretendToBeVisual: true,
})

for (const key of Object.getOwnPropertyNames(dom.window)) {
	if (key === 'globalThis') continue
	const existing = Object.getOwnPropertyDescriptor(globalThis, key)
	if (existing && !existing.configurable) continue
	Object.defineProperty(globalThis, key, {
		value: Reflect.get(dom.window, key),
		configurable: true,
		writable: true,
	})
}
