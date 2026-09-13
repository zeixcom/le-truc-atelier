import './demo-greeter'

describe('demo-greeter', () => {
	const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

	it('greets with the entered name', async () => {
		document.body.innerHTML = `
			<demo-greeter>
				<label for="name">Your name</label>
				<input id="name" name="name" type="text" />
				<p>Hello, <output for="name">World</output>!</p>
			</demo-greeter>
		`
		const input = document.querySelector<HTMLInputElement>('demo-greeter input')!
		const output = document.querySelector('demo-greeter output')!

		expect(output.textContent).toBe('World')

		input.value = 'Ada'
		input.dispatchEvent(new Event('input'))
		await settle()

		expect(output.textContent).toBe('Ada')
	})
})
