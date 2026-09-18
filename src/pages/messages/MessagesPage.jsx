import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { messageService } from '../../services/messageService';
import { useToast } from '../../context/ToastContext';
import { formatMediumDate, formatRelativeTime } from '../../utils/dateHelpers';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { LoadingSpinner } from '../../components/common/LoadingState';
import {
  MessageSquare,
  Send,
  Phone,
  MessageCircle,
  ArrowLeft,
  CheckCheck,
  Sparkles,
  Paperclip,
} from 'lucide-react';

const QUICK_TEMPLATES = [
  'Site visit confirmed for Saturday at 11:00 AM. Our field manager will greet you on site.',
  'Official Agreement of Sale copy has been uploaded to your secure document vault.',
  'Layout approval sketch and price calculation breakdown have been generated for you.',
  'Token advance received with thanks. Official payment receipt dispatched.',
];

export function MessagesPage() {
  const { success } = useToast();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConvId, setActiveConvId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [mobileViewThread, setMobileViewThread] = useState(false);
  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    try {
      const data = await messageService.getAllConversations();
      setConversations(data);
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (activeConvId) {
      messageService.markAsRead(activeConvId);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConvId ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, [activeConvId, activeConversation?.messages?.length]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!replyText.trim() || !activeConvId) return;

    const sent = await messageService.sendMessage(activeConvId, replyText.trim(), 'agent');
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              lastMessage: sent.text,
              timestamp: sent.timestamp,
              messages: [...c.messages, sent],
            }
          : c
      )
    );
    setReplyText('');
  };

  const handleSelectConv = (convId) => {
    setActiveConvId(convId);
    setMobileViewThread(true);
  };

  const cleanPhone = (p) => p?.replace(/[^0-9]/g, '') || '';

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.customerName?.toLowerCase().includes(q) ||
      c.customerPhone?.includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customer Messaging Hub"
        subtitle="Direct WhatsApp, SMS & in-app chat communications with property buyers"
      />

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden h-[calc(100vh-190px)] min-h-[520px] grid grid-cols-1 lg:grid-cols-12">
        {/* Left Pane: Conversation List (4 cols desktop, full on mobile when not viewing thread) */}
        <div
          className={`lg:col-span-4 border-r border-slate-200/80 flex flex-col h-full ${
            mobileViewThread ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-slate-100">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search conversations..."
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <LoadingSpinner text="Loading messages..." className="py-12" />
            ) : filteredConversations.length === 0 ? (
              <p className="text-xs text-slate-400 p-8 text-center">No active chats found.</p>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                    activeConvId === conv.id ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={conv.customerAvatar}
                    alt={conv.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {conv.customerName}
                      </h4>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatRelativeTime(conv.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate leading-relaxed">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane: Thread View (8 cols desktop, full on mobile when viewing thread) */}
        <div
          className={`lg:col-span-8 flex flex-col h-full bg-slate-50/40 ${
            !mobileViewThread ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileViewThread(false)}
                    className="lg:hidden p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={activeConversation.customerAvatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {activeConversation.customerName}
                    </h3>
                    <p className="text-[11px] text-slate-400">{activeConversation.customerPhone}</p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${activeConversation.customerPhone}`}
                    className="p-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl transition-colors cursor-pointer"
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${cleanPhone(activeConversation.customerPhone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors cursor-pointer"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Chat bubble feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {activeConversation.messages.map((msg) => {
                  const isAgent = msg.sender === 'agent';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isAgent
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                        {formatRelativeTime(msg.timestamp)}
                        {isAgent && <CheckCheck className="w-3 h-3 text-emerald-600 inline" />}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick reply templates */}
              <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Templates:
                </span>
                {QUICK_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(tmpl)}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl text-[11px] font-medium border border-slate-200 transition-colors whitespace-nowrap cursor-pointer flex-shrink-0"
                  >
                    {tmpl.slice(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSend}
                className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message or select a quick template..."
                  className="flex-1 py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 stroke-1 mb-2 opacity-50" />
              <p className="text-xs">Select a customer conversation from the left to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

MessagesPage.propTypes = {};
