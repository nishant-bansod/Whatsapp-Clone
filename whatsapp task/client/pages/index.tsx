import { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import { ConversationsList } from '../src/components/ConversationsList';
import { ChatView } from '../src/components/ChatView';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002';
const socket = io(API_BASE);

export default function Home() {
  const [selectedWaId, setSelectedWaId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messagesByWaId, setMessagesByWaId] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetch(`${API_BASE}/api/conversations`).then(r => r.json()).then(setConversations).catch(() => setConversations([]));
  }, []);

  useEffect(() => {
    function onNew(msg: any) {
      setMessagesByWaId(prev => {
        const arr = prev[msg.waId] ? [...prev[msg.waId], msg] : [msg];
        return { ...prev, [msg.waId]: arr };
      });
      setConversations(prev => {
        const idx = prev.findIndex(c => c.waId === msg.waId);
        const updated = {
          waId: msg.waId,
          contactName: msg.contactName,
          lastMessage: msg.text,
          lastType: msg.type,
          lastStatus: msg.status,
          lastTimestamp: msg.timestamp,
          totalMessages: (idx >= 0 ? prev[idx].totalMessages : 0) + 1
        };
        const list = idx >= 0 ? [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)] : [updated, ...prev];
        return list.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
      });
    }
    socket.on('message:new', onNew);
    return () => { socket.off('message:new', onNew); };
  }, []);

  const selectedMessages = useMemo(() => {
    if (!selectedWaId) return [];
    return messagesByWaId[selectedWaId] || [];
  }, [messagesByWaId, selectedWaId]);

  async function selectChat(waId: string) {
    setSelectedWaId(waId);
    if (!messagesByWaId[waId]) {
      try {
        const msgs = await fetch(`${API_BASE}/api/messages?wa_id=${waId}`).then(r => r.json());
        setMessagesByWaId(prev => ({ ...prev, [waId]: msgs }));
      } catch {
        setMessagesByWaId(prev => ({ ...prev, [waId]: [] }));
      }
    }
  }

  return (
    <div className="app">
      <div className="sidebar">
        <ConversationsList
          conversations={conversations}
          selectedWaId={selectedWaId}
          onSelect={selectChat}
        />
      </div>
      <div className="chat">
        {selectedWaId ? (
          <ChatView
            waId={selectedWaId}
            messages={selectedMessages}
            onSend={async (text) => {
              const optimistic = { _id: `tmp-${Date.now()}`, waId: selectedWaId, text, direction: 'outbound', status: 'sent', timestamp: new Date().toISOString() };
              setMessagesByWaId(prev => ({ ...prev, [selectedWaId]: [...(prev[selectedWaId] || []), optimistic] }));
              const saved = await fetch(`${API_BASE}/api/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ waId: selectedWaId, text }) }).then(r => r.json());
              setMessagesByWaId(prev => ({ ...prev, [selectedWaId]: (prev[selectedWaId] || []).map(m => m._id === optimistic._id ? saved : m) }));
            }}
          />
        ) : (
          <div className="empty-state">Select a conversation</div>
        )}
      </div>
    </div>
  );
}


