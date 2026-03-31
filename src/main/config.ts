const isDev = process.env.NODE_ENV === 'development'
const isStaging = process.env.APP_ENV === 'staging'

export const config = {
  backendUrl: isDev
    ? 'http://localhost:3001'
    : isStaging
      ? 'https://staging.seu-backend.com'
      : 'https://seu-backend.com',
  webhookPort: isDev ? 3002 : 3003,
  logLevel: isDev ? 'debug' : 'warn'
}
