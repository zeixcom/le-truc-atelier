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

// jsdom has no IntersectionObserver; module-scrollarea observes its content
// with one on connect. The stub never reports entries, i.e. "no overflow".
if (!('IntersectionObserver' in globalThis)) {
	class IntersectionObserverStub {
		observe(): void {}
		unobserve(): void {}
		disconnect(): void {}
		takeRecords(): IntersectionObserverEntry[] {
			return []
		}
	}
	Object.defineProperty(globalThis, 'IntersectionObserver', {
		value: IntersectionObserverStub,
		configurable: true,
		writable: true,
	})
}

// jsdom's ElementInternals stub leaves `validationMessage` and `validity`
// undefined and has no `setValidity`; le-truc's formAssociated() extension
// feeds the first two into signal cells that reject nullish values, so its
// connect would abort before scheduling any effects. Fill in native-parity
// defaults (all-valid) — no test relies on constraint validation.
const EMPTY_VALIDITY_STATE: ValidityState = {
	valueMissing: false,
	typeMismatch: false,
	patternMismatch: false,
	tooLong: false,
	tooShort: false,
	rangeUnderflow: false,
	rangeOverflow: false,
	stepMismatch: false,
	badInput: false,
	customError: false,
	valid: true,
}

const nativeAttachInternals = HTMLElement.prototype.attachInternals
HTMLElement.prototype.attachInternals = function () {
	const internals = nativeAttachInternals.call(this)
	if (internals.validationMessage === undefined) {
		Object.defineProperty(internals, 'validationMessage', {
			value: '',
			configurable: true,
		})
	}
	if (!internals.validity) {
		Object.defineProperty(internals, 'validity', {
			value: { ...EMPTY_VALIDITY_STATE },
			configurable: true,
		})
	}
	if (typeof internals.setValidity !== 'function') {
		Object.defineProperty(internals, 'setValidity', {
			value: () => {},
			configurable: true,
			writable: true,
		})
	}
	if (typeof internals.setFormValue !== 'function') {
		Object.defineProperty(internals, 'setFormValue', {
			value: () => {},
			configurable: true,
			writable: true,
		})
	}
	return internals
}
