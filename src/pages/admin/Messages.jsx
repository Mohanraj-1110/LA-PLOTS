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
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {messages === null ? (
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      ) : conversations.length > 0 ? (
        <section className="grid min-h-[540px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[280px_1fr]">
          {/* Conversation List */}
          <aside className="border-b border-slate-200 md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
            <div className="p-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Conversations
              </span>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full p-4 text-left transition ${
                    activeId === conv.id
                      ? 'bg-green-50 border-l-4 border-green-600'
                      : 'hover:bg-slate-100/70'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-sm">{conv.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{conv.latest.body}</p>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    {formatTime(conv.latest.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Active Thread */}
          <div className="flex flex-col h-[540px]">
            <header className="border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <div className="size-8 rounded-full bg-green-100 text-green-700 grid place-items-center font-bold text-xs">
                <User size={14} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{activeConversation?.name}</h3>
                <p className="text-xs text-slate-400">Customer Thread</p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {thread.map((msg) => {
                const isMine = msg.agentId === firebaseUser?.uid
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                      isMine
                        ? 'ml-auto bg-green-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.body}</p>
                    <p
                      className={`mt-1 text-[10px] text-right ${
                        isMine ? 'text-green-200' : 'text-slate-400'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-100 p-3 bg-white">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a message or internal note..."
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-green-500 text-slate-900"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700 transition"
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
