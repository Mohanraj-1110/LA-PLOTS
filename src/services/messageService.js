import { api } from './api.js'
import { storage } from './storage.js'

const CONVERSATIONS_KEY = 'la_plots_conversations_v1'

export const messageService = {
  async getAllConversations() {
    try {
      const convos = await api.get('/messages')
      if (Array.isArray(convos)) {
        storage.set(CONVERSATIONS_KEY, convos)
        return convos
      }
      return storage.get(CONVERSATIONS_KEY, [])
    } catch (err) {
      console.warn('[MongoDB Atlas] getAllConversations fallback:', err.message)
      return storage.get(CONVERSATIONS_KEY, [])
    }
  },

  async getConversationById(id) {
    try {
      return await api.get(`/messages/${id}`)
    } catch {
      const convos = await this.getAllConversations()
      return convos.find((c) => c.id === id) || null
    }
  },

  async sendMessage(conversationId, text, sender = 'agent') {
    try {
      const newMsg = await api.post(`/messages/${conversationId}/messages`, { text, sender })
      const convos = await this.getAllConversations()
      const index = convos.findIndex((c) => c.id === conversationId)
      if (index !== -1) {
        convos[index].messages = [...(convos[index].messages || []), newMsg]
        convos[index].lastMessage = text
        convos[index].timestamp = newMsg.timestamp
        storage.set(CONVERSATIONS_KEY, convos)
      }
      return newMsg
    } catch (err) {
      console.warn('[MongoDB Atlas] sendMessage local fallback:', err.message)
      const convos = await this.getAllConversations()
      const index = convos.findIndex((c) => c.id === conversationId)
      if (index === -1) throw new Error(`Conversation ${conversationId} not found`, { cause: err })

      const newMsg = {
        id: `m-${Date.now()}`,
        sender,
        text,
        timestamp: new Date().toISOString(),
      }
      convos[index].messages = [...(convos[index].messages || []), newMsg]
      convos[index].lastMessage = text
      convos[index].timestamp = newMsg.timestamp
      storage.set(CONVERSATIONS_KEY, convos)
      return newMsg
    }
  },

  async markAsRead(conversationId) {
    try {
      await api.put(`/messages/${conversationId}/read`, {})
    } catch (err) {
      console.warn('[MongoDB Atlas] markAsRead fallback:', err.message)
    }
    const convos = await this.getAllConversations()
    const index = convos.findIndex((c) => c.id === conversationId)
    if (index !== -1) {
      convos[index].unreadCount = 0
      storage.set(CONVERSATIONS_KEY, convos)
    }
  },
}
