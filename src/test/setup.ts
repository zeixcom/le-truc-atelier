import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
	url: 'http://localhost:5173/',
	pretendToBeVisual: true,
})

// Timers, console, performance and fetch must stay Bun's own: jsdom's
// versions self-reference when placed on the host global and recurse.
const keepBun = new Set([
	'globalThis',
	'console',
	'fetch',
	'performance',
	'setTimeout',
	'clearTimeout',
	'setInterval',
	'clearInterval',
	'queueMicrotask',
	'requestAnimationFrame',
	'cancelAnimationFrame',
])

for (const key of Object.getOwnPropertyNames(dom.window)) {
	if (keepBun.has(key)) continue
	const existing = Object.getOwnPropertyDescriptor(globalThis, key)
	if (existing && !existing.configurable) continue
	Object.defineProperty(globalThis, key, {
		value: Reflect.get(dom.window, key),
		configurable: true,
		writable: true,
	})
}
