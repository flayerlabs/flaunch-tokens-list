# Flaunch Token List API

A Cloudflare Worker that provides a RESTful API to query and retrieve a list of all tokens launched on the Flaunch platform on the Base blockchain (chain ID: 8453).

## Overview

This service aggregates token data from the Flaunch platform and provides it in a standardized format. It's designed for aggregators and developers who need to build comprehensive lists of all Flaunch tokens on Base.

## Endpoints

### GET `/tokens`

Returns a list of Flaunch tokens in JSON format.

**Response Format:**
```json
{
  "code": 1,
  "message": "",
  "result": [
    {
      "chainId": 8453,
      "address": "0x...",
      "creator": "0x...",
      "launchTime": 1234567890,
      "orderId": 1234567890
    }
  ]
}
```

**Response Fields:**
- `code`: Status code (1 = success, 0 = error)
- `message`: Error message (empty on success)
- `result`: Array of token objects
  - `chainId`: Always `8453` (Base Mainnet)
  - `address`: Token contract address
  - `creator`: Wallet address of the token creator
  - `launchTime`: Unix timestamp of when the token was launched
  - `orderId`: Order ID (same as `createdAt` timestamp, used for pagination)

### GET `/` (HTML Preview)

Returns an HTML page that provides a visual preview of the token list. The page displays tokens in a table format with clickable links to BaseScan for both token addresses and creator addresses.

The HTML preview accepts the same query parameters as the JSON endpoint and displays the results in a user-friendly format.

## Query Parameters

All parameters are optional and can be combined:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | `1000` | Maximum number of tokens to return. Must be between 1 and 1000. Values above 1000 will be capped at 1000. |
| `creator` | string | (none) | Filter tokens by creator wallet address. Returns only tokens created by the specified address. |
| `orderId` | integer | `0` | Pagination parameter. Returns tokens with `orderId` greater than this value. Use this to fetch tokens created after a specific timestamp. |

## Examples

### Get all tokens (up to 1000)
```bash
curl https://your-worker-domain.workers.dev/tokens
```

### Get tokens with a limit
```bash
curl https://your-worker-domain.workers.dev/tokens?limit=100
```

### Filter by creator address
```bash
curl https://your-worker-domain.workers.dev/tokens?creator=0x1234567890123456789012345678901234567890
```

### Pagination - Get tokens after a specific orderId
```bash
curl https://your-worker-domain.workers.dev/tokens?orderId=1234567890&limit=1000
```

### Combine parameters
```bash
curl https://your-worker-domain.workers.dev/tokens?limit=500&creator=0x1234567890123456789012345678901234567890&orderId=1234567890
```

### HTML Preview
Open in browser:
```
https://your-worker-domain.workers.dev/?limit=250&creator=0x1234567890123456789012345678901234567890
```

## Use Cases

### For Aggregators

This API is designed to help aggregators build a complete list of all Flaunch tokens on Base (chain ID: 8453). To retrieve all tokens:

1. **Initial Request**: Start with `GET /tokens?limit=1000` to get the first 1000 tokens
2. **Pagination**: Use the highest `orderId` from the response as the `orderId` parameter in the next request
3. **Repeat**: Continue fetching until you receive fewer tokens than the limit (indicating you've reached the end)

**Example Pagination Flow:**
```bash
# First request
curl /tokens?limit=1000
# Response contains tokens with orderId up to 1234567890

# Second request (get next batch)
curl /tokens?limit=1000&orderId=1234567890
# Response contains tokens with orderId up to 1234567891

# Continue until response has fewer than 1000 tokens
```

### For Developers

- **Token Discovery**: Find all tokens launched on Flaunch
- **Creator Analytics**: Filter tokens by creator to analyze specific wallets
- **Integration**: Integrate Flaunch token data into your application or service
- **Monitoring**: Track new token launches by polling with increasing `orderId` values

## Response Codes

- `200 OK`: Successful request
- `404 Not Found`: Invalid endpoint path
- `500 Internal Server Error`: Error fetching data from the GraphQL backend

## Chain Information

All tokens returned by this API are on:
- **Chain ID**: `8453`
- **Network**: Base Mainnet
- **Explorer**: https://basescan.org

## Development

### Local Development

```bash
npm run dev
```

The worker will be available at `http://localhost:8787`

### Deploy

```bash
npm run deploy
```

## Technical Details

- **Platform**: Cloudflare Workers
- **Data Source**: GraphQL endpoint at `https://flayerlabs-dbd4b3f.dedicated.hyperindex.xyz/v1/graphql` (Envio HyperIndex)
- **Ordering**: Tokens are ordered by `createdAt` in ascending order
- **Maximum Limit**: 1000 tokens per request

## License

[Add your license information here]

