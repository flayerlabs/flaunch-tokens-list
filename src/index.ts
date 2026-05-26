/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://lbocalhost:8787/ to see your worker in action
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

		const GRAPHQL_ENDPOINT = 'https://flayerlabs-dbd4b3f.dedicated.hyperindex.xyz/v1/graphql';

		let limit = parseInt(url.searchParams.get('limit') || '1000', 10);
		const creator = url.searchParams.get('creator') || '';
		const orderId = parseInt(url.searchParams.get('orderId') || '0', 10);

		// We max out our limit at 1000
		if (limit > 1000) {
			limit = 1000;
		}

		// Build the dynamic 'where' object (Hasura _bool_exp syntax)
		const where: any = {};
		if (orderId > 0) where.createdAt = { _gt: orderId };
		if (creator) where.creatorId = { _eq: creator };

		const graphqlQuery = {
			query: `
				query Coins($limit: Int!, $where: Coin_bool_exp) {
					Coin(order_by: { createdAt: asc }, limit: $limit, where: $where) {
						id
						creatorId
						createdAt
					}
				}
			`,
			variables: { limit, where },
		};

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

		const formattedResult = data.Coin.map((result: any) => ({
			chainId: 8453,
			address: result.id,
			creator: result.creatorId,
			launchTime: Number(result.createdAt),
			orderId: Number(result.createdAt),
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
