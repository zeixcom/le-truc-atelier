import index from '../index.html'

const server = Bun.serve({
	port: 5173,
	development: true,
	routes: {
		'/': index,
	},
})

console.log(`Le Truc Atelier dev server running at ${server.url}`)
