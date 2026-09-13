import { bindText, defineComponent } from '@zeix/le-truc'

defineComponent<{ name: string }>(
	'demo-greeter',
	({ expose, first, on, watch }) => {
		const output = first('output', 'Needed to display the greeting.')
		const fallback = output.textContent || ''

		expose({ name: fallback })

		const input = first('input', 'Needed to enter the name.')
		on(input, 'input', () => ({ name: input.value || fallback }))
		watch('name', bindText(output))
	},
)
