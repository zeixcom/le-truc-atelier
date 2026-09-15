import { beforeEach, describe, expect, it } from 'bun:test'

import '../../form/listbox/form-listbox'
import '../../module/lazyload/module-lazyload'
import './module-listnav'

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

// A stale hash would make module-listnav write `listbox.value` during
// connect — before the listbox has initialized its reactive accessor —
// which breaks the listbox's own effects in test mounts. Start hashless.
beforeEach(() => {
	history.replaceState(null, '', location.pathname)
})

// module-listnav requires both a form-listbox and a module-lazyload descendant
const mount = () => {
	document.body.innerHTML = `
		<module-listnav>
			<nav>
				<h2 id="components-label">Components</h2>
				<form-listbox id="components">
					<input type="hidden" name="component">
					<div role="listbox" aria-labelledby="components-label">
						<div role="group" aria-labelledby="components-group">
							<div role="presentation" id="components-group">Demo</div>
							<button type="button" role="option" tabindex="0"
								value="./partials/page-a.html" aria-selected="true">Page A</button>
							<button type="button" role="option" tabindex="-1"
								value="./partials/page-b.html">Page B</button>
						</div>
					</div>
				</form-listbox>
			</nav>
			<module-lazyload>
				<card-callout>
					<p class="loading" role="status">Loading…</p>
					<p class="error" role="alert" aria-live="assertive" hidden></p>
				</card-callout>
				<div class="content" hidden></div>
			</module-lazyload>
		</module-listnav>
	`
}

describe('module-listnav', () => {
	it('syncs the listbox selection to the URL hash', async () => {
		mount()
		await settle()

		expect(location.hash).toBe('#page-a')
	})

	it('passes the selection to the lazyload target', async () => {
		mount()
		await settle()

		const lazyload = document.querySelector<HTMLElement>('module-lazyload')
		expect((lazyload as HTMLElement & { src: string }).src).toBe(
			'./partials/page-a.html',
		)
	})

	it('syncs the URL hash back to the listbox selection', async () => {
		mount()
		await settle()
		expect(location.hash).toBe('#page-a')

		location.hash = '#page-b'
		await settle()
		await settle()

		const listbox = document.querySelector<HTMLElement>('form-listbox')
		const selected = document.querySelector(
			'form-listbox button[role="option"][aria-selected="true"]',
		)
		expect((listbox as HTMLElement & { value: string }).value).toBe(
			'./partials/page-b.html',
		)
		expect(selected?.getAttribute('value')).toBe('./partials/page-b.html')
	})
})
