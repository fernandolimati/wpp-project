interface HubSpotConfig {
  apiKey: string
}

export async function syncContactToHubSpot(
  contact: { name: string; phone: string; email?: string },
  config: HubSpotConfig
): Promise<string> {
  const nameParts = contact.name.split(' ')
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        firstname: nameParts[0],
        lastname: nameParts.slice(1).join(' '),
        phone: contact.phone,
        email: contact.email
      }
    })
  })

  const data = (await response.json()) as { id: string }
  return data.id
}

export async function logMessageToHubSpot(
  contactId: string,
  message: string,
  config: HubSpotConfig
): Promise<void> {
  await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        hs_note_body: message,
        hs_timestamp: new Date().toISOString()
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }]
        }
      ]
    })
  })
}
