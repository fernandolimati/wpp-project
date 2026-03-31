import { Chat, Message, Contact } from '@/types'

const contacts: Contact[] = [
  {
    id: '1',
    name: 'Ana Silva',
    avatar: '',
    phone: '+55 11 99999-0001',
    about: 'Disponível',
    lastSeen: new Date(2026, 2, 31, 10, 30),
    online: true
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    avatar: '',
    phone: '+55 11 99999-0002',
    about: 'No trabalho',
    lastSeen: new Date(2026, 2, 31, 9, 15),
    online: false
  },
  {
    id: '3',
    name: 'Maria Santos',
    avatar: '',
    phone: '+55 11 99999-0003',
    about: 'Ocupada 🚀',
    lastSeen: new Date(2026, 2, 31, 11, 0),
    online: true
  },
  {
    id: '4',
    name: 'João Pereira',
    avatar: '',
    phone: '+55 11 99999-0004',
    about: 'Só mensagens urgentes',
    lastSeen: new Date(2026, 2, 30, 18, 45),
    online: false
  },
  {
    id: '5',
    name: 'Fernanda Costa',
    avatar: '',
    phone: '+55 11 99999-0005',
    about: 'Paz ✌️',
    lastSeen: new Date(2026, 2, 31, 8, 0),
    online: false
  },
  {
    id: '6',
    name: 'Pedro Almeida',
    avatar: '',
    phone: '+55 11 99999-0006',
    about: 'Dev Full Stack',
    lastSeen: new Date(2026, 2, 31, 11, 30),
    online: true
  },
  {
    id: '7',
    name: 'Família 👨‍👩‍👧‍👦',
    avatar: '',
    phone: '',
    about: 'Grupo da família',
    lastSeen: new Date(),
    online: false
  }
]

export const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', chatId: '1', content: 'Oi! Tudo bem?', timestamp: new Date(2026, 2, 31, 9, 0), sender: 'them', status: 'read', type: 'text' },
    { id: 'm2', chatId: '1', content: 'Tudo ótimo! E você?', timestamp: new Date(2026, 2, 31, 9, 1), sender: 'me', status: 'read', type: 'text' },
    { id: 'm3', chatId: '1', content: 'Muito bem! Vamos almoçar hoje?', timestamp: new Date(2026, 2, 31, 9, 2), sender: 'them', status: 'read', type: 'text' },
    { id: 'm4', chatId: '1', content: 'Claro! Que horas?', timestamp: new Date(2026, 2, 31, 9, 3), sender: 'me', status: 'read', type: 'text' },
    { id: 'm5', chatId: '1', content: 'Meio-dia no lugar de sempre 😊', timestamp: new Date(2026, 2, 31, 9, 5), sender: 'them', status: 'read', type: 'text' },
    { id: 'm6', chatId: '1', content: 'Perfeito! Te vejo lá! 🍕', timestamp: new Date(2026, 2, 31, 9, 6), sender: 'me', status: 'delivered', type: 'text' }
  ],
  '2': [
    { id: 'm7', chatId: '2', content: 'E aí, terminou o relatório?', timestamp: new Date(2026, 2, 31, 8, 30), sender: 'me', status: 'read', type: 'text' },
    { id: 'm8', chatId: '2', content: 'Quase! Falta a parte de métricas', timestamp: new Date(2026, 2, 31, 8, 35), sender: 'them', status: 'read', type: 'text' },
    { id: 'm9', chatId: '2', content: 'Preciso até as 17h, ok?', timestamp: new Date(2026, 2, 31, 8, 36), sender: 'me', status: 'read', type: 'text' },
    { id: 'm10', chatId: '2', content: 'Tranquilo, envio antes das 16h', timestamp: new Date(2026, 2, 31, 8, 40), sender: 'them', status: 'read', type: 'text' }
  ],
  '3': [
    { id: 'm11', chatId: '3', content: 'Viu o deploy de hoje?', timestamp: new Date(2026, 2, 31, 10, 0), sender: 'them', status: 'read', type: 'text' },
    { id: 'm12', chatId: '3', content: 'Vi sim! Ficou show 🎉', timestamp: new Date(2026, 2, 31, 10, 5), sender: 'me', status: 'read', type: 'text' },
    { id: 'm13', chatId: '3', content: 'O novo dashboard tá muito bom', timestamp: new Date(2026, 2, 31, 10, 6), sender: 'them', status: 'read', type: 'text' },
    { id: 'm14', chatId: '3', content: 'Obrigado! Demorou mas saiu haha', timestamp: new Date(2026, 2, 31, 10, 10), sender: 'me', status: 'read', type: 'text' },
    { id: 'm15', chatId: '3', content: 'Agora bora pro próximo sprint! 💪', timestamp: new Date(2026, 2, 31, 10, 12), sender: 'them', status: 'read', type: 'text' }
  ],
  '4': [
    { id: 'm16', chatId: '4', content: 'Fala João! Jogo sábado?', timestamp: new Date(2026, 2, 30, 17, 0), sender: 'me', status: 'read', type: 'text' },
    { id: 'm17', chatId: '4', content: 'Bora! Mesma hora?', timestamp: new Date(2026, 2, 30, 17, 30), sender: 'them', status: 'read', type: 'text' },
    { id: 'm18', chatId: '4', content: '10h na quadra do parque', timestamp: new Date(2026, 2, 30, 17, 31), sender: 'me', status: 'delivered', type: 'text' }
  ],
  '5': [
    { id: 'm19', chatId: '5', content: 'Boa noite! Conseguiu resolver aquele bug?', timestamp: new Date(2026, 2, 30, 22, 0), sender: 'them', status: 'read', type: 'text' },
    { id: 'm20', chatId: '5', content: 'Sim! Era um problema no middleware', timestamp: new Date(2026, 2, 30, 22, 15), sender: 'me', status: 'read', type: 'text' },
    { id: 'm21', chatId: '5', content: 'Maravilha! Amanhã fazemos code review', timestamp: new Date(2026, 2, 30, 22, 20), sender: 'them', status: 'read', type: 'text' }
  ],
  '6': [
    { id: 'm22', chatId: '6', content: 'Pedro, pode dar uma olhada no PR?', timestamp: new Date(2026, 2, 31, 11, 0), sender: 'me', status: 'delivered', type: 'text' },
    { id: 'm23', chatId: '6', content: 'Qual repo?', timestamp: new Date(2026, 2, 31, 11, 5), sender: 'them', status: 'read', type: 'text' },
    { id: 'm24', chatId: '6', content: 'O wpp-project, PR #42', timestamp: new Date(2026, 2, 31, 11, 6), sender: 'me', status: 'read', type: 'text' },
    { id: 'm25', chatId: '6', content: 'Olhando agora! 👀', timestamp: new Date(2026, 2, 31, 11, 10), sender: 'them', status: 'read', type: 'text' }
  ],
  '7': [
    { id: 'm26', chatId: '7', content: 'Alguém vai no aniversário do vovô?', timestamp: new Date(2026, 2, 31, 7, 0), sender: 'them', status: 'read', type: 'text' },
    { id: 'm27', chatId: '7', content: 'Eu vou! 🎂', timestamp: new Date(2026, 2, 31, 7, 10), sender: 'me', status: 'read', type: 'text' },
    { id: 'm28', chatId: '7', content: 'Eu também!', timestamp: new Date(2026, 2, 31, 7, 15), sender: 'them', status: 'read', type: 'text' }
  ]
}

export const mockChats: Chat[] = contacts.map((contact) => {
  const messages = mockMessages[contact.id] || []
  const lastMessage = messages[messages.length - 1] || null
  return {
    id: contact.id,
    contact,
    lastMessage,
    unreadCount: contact.id === '3' ? 2 : contact.id === '7' ? 5 : 0,
    pinned: contact.id === '1' || contact.id === '3'
  }
})
