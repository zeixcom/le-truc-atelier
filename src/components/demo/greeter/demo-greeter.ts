import { bindText, defineComponent } from '@zeix/le-truc'

defineComponent<{ subject: string }>(
	'demo-greeter',
	({ expose, first, on, watch }) => {
		const output = first('output', 'Needed to display the greeting.')
		const fallback = output.textContent || ''

		expose({ subject: fallback })

		const input = first('input', 'Needed to enter whom to greet.')
		on(input, 'input', () => ({ subject: input.value || fallback }))
		watch('subject', bindText(output))
	},
)
