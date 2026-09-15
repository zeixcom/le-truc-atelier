import { describe, expect, it } from 'bun:test'

import './module-splitview'

describe('module-splitview', () => {
	const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

	const mount = (attrs = '') => {
		document.body.innerHTML = `
			<module-splitview ${attrs}>
				<div>Start panel</div>
				<button
					type="button"
					class="divider"
					role="separator"
					aria-label="Resize panels"
					aria-orientation="horizontal"
					aria-valuenow="50"
					aria-valuemin="10"
					aria-valuemax="90"
				></button>
				<div>End panel</div>
			</module-splitview>
		`
		const host = document.querySelector<HTMLElement>('module-splitview')
		const divider = host?.querySelector<HTMLElement>('button.divider')
		if (!host || !divider) throw new Error('module-splitview markup not found')
		return { host, divider }
	}

	it('defaults to a 50/50 split', async () => {
		const { host } = mount()
		await settle()
		expect(host.style.getPropertyValue('--module-splitview-ratio')).toBe(
			'50.00%',
		)
		expect(host.querySelector('.divider')?.getAttribute('aria-valuenow')).toBe(
			'50',
		)
	})

	it('reads the initial split from the split attribute', async () => {
		const { host } = mount('split="0.3"')
		await settle()
		expect(host.style.getPropertyValue('--module-splitview-ratio')).toBe(
			'30.00%',
		)
		expect(host.querySelector('.divider')?.getAttribute('aria-valuenow')).toBe(
			'30',
		)
	})

	it('resizes with arrow keys on the divider', async () => {
		const { host, divider } = mount()
		await settle()
		divider.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
		)
		await settle()
		expect(host.style.getPropertyValue('--module-splitview-ratio')).toBe(
			'55.00%',
		)
		divider.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
		)
		await settle()
		expect(host.style.getPropertyValue('--module-splitview-ratio')).toBe(
			'50.00%',
		)
	})
})
