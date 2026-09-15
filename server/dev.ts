import index from '../index.html'
import demoGreeterPartial from '../src/partials/demo-greeter.html'

const server = Bun.serve({
	port: 5173,
	development: true,
	routes: {
		'/': index,
		'/partials/demo-greeter.html': demoGreeterPartial,
	},
})

console.log(`Le Truc Atelier dev server running at ${server.url}`)
