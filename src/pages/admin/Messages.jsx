import React, { useEffect, useMemo, useState } from 'react'
import { Send, User } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { sendMessage, subscribeToMessages } from '../../services/messages'

function time(val) {
  return val && typeof val === 'object' && 'toDate' in val ? val.toDate().getTime() : 0
}

function formatTime(val) {
  return val && typeof val === 'object' && 'toDate' in val
    ? val.toDate().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
    : 'Recently'
}

export function Messages() {
  const { firebaseUser } = useAuth()
  const [messages, setMessages] = useState(null)
  const [selectedId, setSelectedId] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = subscribeToMessages(
      (data) => setMessages(data),
      () => setError('Messages could not be loaded.')
    )
    return () => unsub()
  }, [])

  const conversations = useMemo(() => {
    if (!messages) return []
    const groups = {}
    messages.forEach((msg) => {
      const id = msg.customerId || 'general'
      if (!groups[id] || time(msg.createdAt) > time(groups[id].latest.createdAt)) {
        groups[id] = {
          id,
          name: msg.customerName || 'Customer',
          latest: msg,
        }
      }
    })
    return Object.values(groups).sort(
      (a, b) => time(b.latest.createdAt) - time(a.latest.createdAt)
    )
  }, [messages])

  const activeId = selectedId || conversations[0]?.id || ''
  const activeConversation = conversations.find((c) => c.id === activeId)
  const thread = useMemo(() => {
    if (!messages) return []
    return messages
      .filter((m) => (m.customerId || 'general') === activeId)
      .sort((a, b) => time(a.createdAt) - time(b.createdAt))
  }, [messages, activeId])

  async function handleSend(e) {
    e.preventDefault()
    if (!body.trim() || !activeConversation) return
    try {
      await sendMessage({
        customerId: activeConversation.id,
        customerName: activeConversation.name,
        agentId: firebaseUser?.uid || '',
        body: body.trim(),
      })
      setBody('')
    } catch {
      setError('Could not send message.')
    }
  }

  return (
    <>
      <PageHeader
        title="Customer Messages & Notes"
        description="Internal discussion threads and follow-up communication with buyers."
      />

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 shadow-card">
          {error}
        </div>
      )}

      {messages === null ? (
        <div className="h-96 animate-pulse rounded-2xl bg-surface-200 shadow-card" />
      ) : conversations.length > 0 ? (
        <section className="card-modern grid min-h-[540px] overflow-hidden md:grid-cols-[280px_1fr] p-0">
          {/* Conversation List */}
          <aside className="border-b border-surface-100 md:border-b-0 md:border-r border-surface-100 bg-surface-50">
            <div className="p-4 border-b border-surface-100">
              <span className="text-xs font-bold uppercase tracking-wider text-surface-400">
                Conversations
              </span>
            </div>
            <div className="divide-y divide-surface-100 overflow-y-auto max-h-[500px]">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full p-4 text-left transition-all ${
                    activeId === conv.id
                      ? 'bg-primary-50 border-l-4 border-primary-600'
                      : 'hover:bg-surface-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      activeId === conv.id
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                        : 'bg-surface-200 text-surface-600'
                    }`}>
                      <User size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-surface-900 text-sm truncate">{conv.name}</p>
                      <p className="mt-0.5 truncate text-xs text-surface-500">{conv.latest.body}</p>
                      <span className="mt-0.5 block text-[10px] text-surface-400">
                        {formatTime(conv.latest.createdAt)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Active Thread */}
          <div className="flex flex-col h-[540px]">
            <header className="border-b border-surface-100 px-6 py-4 flex items-center gap-3 bg-white">
              <div className="size-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white grid place-items-center font-bold text-xs shadow-card">
                <User size={15} />
              </div>
              <div>
                <h3 className="font-display font-bold text-surface-900 text-sm">{activeConversation?.name}</h3>
                <p className="text-xs text-surface-400">Customer Thread</p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-surface-50/30">
              {thread.map((msg) => {
                const isMine = msg.agentId === firebaseUser?.uid
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                      isMine
                        ? 'ml-auto bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-br-md shadow-card'
                        : 'bg-white text-surface-800 rounded-bl-md shadow-card border border-surface-100'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.body}</p>
                    <p
                      className={`mt-1.5 text-[10px] text-right ${
                        isMine ? 'text-primary-200' : 'text-surface-400'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleSend} className="flex gap-2 border-t border-surface-100 p-3 bg-white">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a message or internal note..."
                className="input-modern min-h-11 min-w-0 flex-1"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 text-sm font-bold text-white hover:from-primary-700 hover:to-primary-600 transition shadow-card hover:shadow-elevated"
              >
                <Send size={16} />
                Send
              </button>
            </form>
          </div>
        </section>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No conversations yet"
            description="Buyer messages and agent updates will be collected here."
          />
        </div>
      )}
    </>
  )
}
export default Messages
