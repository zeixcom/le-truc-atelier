import { describe, expect, it } from 'bun:test'

// Component definitions under test, in the same dependency order as src/main.ts
import './demo/greeter/demo-greeter'
import './form/listbox/form-listbox'
import './module/lazyload/module-lazyload'
import './module/listnav/module-listnav'
import './module/scrollarea/module-scrollarea'
import './module/splitview/module-splitview'
import './module/component-editor/module-component-editor'
import './module/properties-editor/module-properties-editor'

describe('atelier workspace layout', () => {
	const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

	// Mirrors the <body> of index.html: listnav coordinates the component
	// tree (left) with the lazily loaded editor content (main); the nested
	// splitview separates the editor from the properties panel (right).
	const mount = () => {
		document.body.innerHTML = `
			<module-listnav>
				<module-splitview id="workspace" split="0.2">
					<module-scrollarea>
						<nav>
							<h2 id="components-label">Components</h2>
							<form-listbox id="components">
								<input type="hidden" name="component">
								<div role="listbox" aria-labelledby="components-label">
									<div role="group" aria-labelledby="components-group">
										<div role="presentation" id="components-group">Demo</div>
										<button type="button" role="option" tabindex="0"
											value="./partials/demo-greeter.html"
											aria-selected="true">demo-greeter</button>
									</div>
								</div>
							</form-listbox>
						</nav>
					</module-scrollarea>
					<button
						type="button"
						class="divider"
						role="separator"
						aria-label="Resize panels"
						aria-orientation="horizontal"
						aria-valuenow="20"
						aria-valuemin="10"
						aria-valuemax="90"
					></button>
					<module-splitview id="editors" split="0.7">
						<module-scrollarea>
							<module-component-editor>
								<module-lazyload>
									<card-callout>
										<p class="loading" role="status">Loading…</p>
										<p class="error" role="alert" aria-live="assertive" hidden></p>
									</card-callout>
									<div class="content" hidden></div>
								</module-lazyload>
							</module-component-editor>
						</module-scrollarea>
						<button
							type="button"
							class="divider"
							role="separator"
							aria-label="Resize panels"
							aria-orientation="horizontal"
							aria-valuenow="70"
							aria-valuemin="10"
							aria-valuemax="90"
						></button>
						<module-scrollarea>
							<module-properties-editor>
								<h2>demo-greeter</h2>
							</module-properties-editor>
						</module-scrollarea>
					</module-splitview>
				</module-splitview>
			</module-listnav>
		`
	}

	it('upgrades all layout components', async () => {
		mount()
		await settle()

		for (const tag of [
			'module-listnav',
			'module-splitview',
			'module-scrollarea',
			'form-listbox',
			'module-lazyload',
			'module-component-editor',
			'module-properties-editor',
		]) {
			expect(customElements.get(tag)).toBeTypeOf('function')
			expect(document.querySelector(tag)).toBeInstanceOf(HTMLElement)
		}
	})

	it('selects the initial component and opens it in the editor area', async () => {
		mount()
		await settle()

		expect(location.hash).toBe('#demo-greeter')

		const lazyload = document.querySelector<HTMLElement>('module-lazyload')
		expect((lazyload as HTMLElement & { src: string }).src).toBe(
			'./partials/demo-greeter.html',
		)
	})

	it('opens another component in the editor area when clicked', async () => {
		mount()
		await settle()

		const listbox = document.querySelector(
			'button[role="option"]',
		) as HTMLButtonElement
		listbox.dispatchEvent(new Event('click', { bubbles: true }))
		await settle()

		// Single-option tree: clicking re-selects demo-greeter; the hash and
		// the editor content stay in sync.
		expect(location.hash).toBe('#demo-greeter')
		const lazyload = document.querySelector<HTMLElement>('module-lazyload')
		expect((lazyload as HTMLElement & { src: string }).src).toBe(
			'./partials/demo-greeter.html',
		)
	})

	it('sizes the workspace panes from the split attributes', async () => {
		mount()
		await settle()

		const workspace = document.getElementById('workspace')
		const editors = document.getElementById('editors')
		expect(workspace?.style.getPropertyValue('--module-splitview-ratio')).toBe(
			'20.00%',
		)
		expect(editors?.style.getPropertyValue('--module-splitview-ratio')).toBe(
			'70.00%',
		)
	})
})
