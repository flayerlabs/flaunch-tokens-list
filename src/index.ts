/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname !== '/tokens') {
			return new Response('Not Found', { status: 404 });
		}

		const GRAPHQL_ENDPOINT = 'https://g.flayerlabs.xyz/flaunch/base-mainnet';

		let limit = parseInt(url.searchParams.get('limit') || '1000', 10);
		const orderId = parseInt(url.searchParams.get('orderId') || '0', 10);

		// We max out our limit at 1000
		if (limit > 1000) {
			limit = 1000;
		}

		let graphqlQuery = {
			query: `
				query CollectionTokens($limit: Int!, $createdAt: BigInt!) {
					collectionTokens(orderBy: createdAt, orderDirection: asc, first: $limit, where: { createdAt_gt: $createdAt }) {
						id
						createdAt
					}
				}
			`,
			variables: { limit: limit, createdAt: orderId },
		};

		if (orderId == 0) {
			graphqlQuery = {
				query: `
					query CollectionTokens($limit: Int!) {
						collectionTokens(orderBy: createdAt, orderDirection: asc, first: $limit) {
							id
							createdAt
						}
					}
				`,
				variables: { limit: limit },
			};
		}

		const response = await fetch(GRAPHQL_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(graphqlQuery),
		});

		if (!response.ok) {
			return new Response(JSON.stringify({ code: 0, message: 'Error fetching data', result: [] }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const { data } = await response.json();

		const formattedResult = data.collectionTokens.map((result: any) => ({
			chainId: 8543,
			address: result.id,
			launchTime: result.createdAt,
			orderId: result.createdAt,
		}));

		return new Response(
			JSON.stringify({
				code: 1,
				message: '',
				result: formattedResult,
			}),
			{
				headers: { 'Content-Type': 'application/json' },
			}
		);
	},
} satisfies ExportedHandler<Env>;
