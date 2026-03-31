interface ChatbotConfig {
  apiUrl: string
  apiKey: string
  model?: string
}

export async function processBotResponse(
  incomingMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  config: ChatbotConfig
): Promise<string> {
  const response = await fetch(`${config.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um assistente de atendimento.' },
        ...conversationHistory,
        { role: 'user', content: incomingMessage }
      ]
    })
  })

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices[0]!.message.content
}
