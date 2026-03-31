interface SendTextPayload {
  to: string // E.164 format: +5511999999999
  text: string
  replyMessageId?: string
}

interface WhatsAppConfig {
  apiUrl: string
  token: string
  phoneNumberId: string
}

export async function sendWhatsAppMessage(
  payload: SendTextPayload,
  config: WhatsAppConfig
): Promise<string> {
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: payload.to,
    type: 'text',
    text: { body: payload.text },
    ...(payload.replyMessageId && {
      context: { message_id: payload.replyMessageId }
    })
  }

  const response = await fetch(`${config.apiUrl}/${config.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`)
  }

  const data = (await response.json()) as { messages: Array<{ id: string }> }
  return data.messages[0]!.id
}

export function whatsappWebhookAdapter(
  entry: Record<string, unknown>
): {
  externalId: string
  from: string
  text: string
  timestamp: number
} | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changes = (entry as any).changes[0]
    const message = changes.value.messages?.[0]
    if (!message) return null

    return {
      externalId: message.id,
      from: message.from,
      text: message.text?.body ?? '',
      timestamp: Number(message.timestamp) * 1000
    }
  } catch {
    return null
  }
}
