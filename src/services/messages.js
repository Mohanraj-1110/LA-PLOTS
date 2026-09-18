import { api } from './api.js'

export function subscribeToMessages(onChange, onError) {
  let isMounted = true

  const fetchMessages = async () => {
    try {
      const convos = await api.get('/messages')
      if (isMounted) {
        onChange(Array.isArray(convos) ? convos : [])
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToMessages notice:', err?.message)
        onChange([])
        if (onError) onError(err)
      }
    }
  }

  fetchMessages()
  const intervalId = setInterval(fetchMessages, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

export async function sendMessage(input) {
  // If sending to a specific conversation
  if (input.conversationId) {
    return api.post(`/messages/${input.conversationId}/messages`, {
      text: input.body || input.text,
      sender: input.sender || 'agent',
    })
  }
  return api.post('/messages', {
    ...input,
    createdAt: new Date().toISOString(),
  })
}
