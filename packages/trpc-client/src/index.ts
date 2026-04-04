import { createTRPCClient, httpBatchLink } from "@trpc/client"
import superjson from "superjson"
import type { AppRouter } from "../../apps/cloud/src/server/trpc"

export function createSkyDeskClient(config: {
  url: string
  getAccessToken: () => string | null
}) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: config.url,
        transformer: superjson,
        headers() {
          const token = config.getAccessToken()
          return token
            ? { Authorization: `Bearer ${token}` }
            : {}
        },
      }),
    ],
  })
}

export type { AppRouter }
