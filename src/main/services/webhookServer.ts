import { createServer, IncomingMessage, ServerResponse } from 'http'
import type { Server } from 'http'
import { getDb } from '../database'
import type { BrowserWindow } from 'electron'

let server: Server | null = null

export function startWebhookServer(port: number, win: BrowserWindow): void {
  server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      res.writeHead(405)
      res.end('Method Not Allowed')
      return
    }

    const urlParts = req.url?.split('/') ?? []
    const source = urlParts[2] // /webhook/:source

    if (!source) {
      res.writeHead(400)
      res.end('Missing source')
      return
    }

    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
      // Limit body size to 10MB
      if (body.length > 10 * 1024 * 1024) {
        res.writeHead(413)
        res.end('Payload too large')
        req.destroy()
      }
    })

    req.on('end', () => {
      try {
        const payload = JSON.parse(body)
        const db = getDb()
        db.prepare(
          `INSERT INTO webhook_queue (payload, status) VALUES (?, 'pending')`
        ).run(JSON.stringify({ source, payload }))

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ received: true }))

        processWebhookEvent(source, payload, win).catch(console.error)
      } catch {
        res.writeHead(400)
        res.end('Invalid JSON')
      }
    })
  })

  server.listen(port, '127.0.0.1', () => {
    console.log(`[Webhook] Listening on 127.0.0.1:${port}`)
  })
}

async function processWebhookEvent(
  source: string,
  _payload: Record<string, unknown>,
  _win: BrowserWindow
): Promise<void> {
  // Route to appropriate adapter based on source
  if (source === 'whatsapp') {
    // const message = whatsappWebhookAdapter(payload)
    // if (message) { messagesRepo.insert(message); win.webContents.send('messages:new', message) }
  }
  // Add more sources as needed
}

export function stopWebhookServer(): void {
  server?.close()
}
