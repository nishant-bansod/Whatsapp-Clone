import { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import { ConversationsList } from '../src/components/ConversationsList';
import { ChatView } from '../src/components/ChatView';

const API_BASE = 'https://whatsapp-backend-ey2f.onrender.com';
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
      {/* WhatsApp Web Header */}
      <div className="whatsapp-header">
        <div className="header-left">
          <div className="whatsapp-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            <span>WhatsApp Web</span>
          </div>
        </div>
        <div className="header-right">
          <button className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </button>
          <button className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </button>
          <button className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="main-content">
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
            <div className="welcome-screen">
              <div className="welcome-content">
                <h1>Welcome to WhatsApp Web</h1>
                <p>Send and receive messages without keeping your phone online.</p>
                
                <div className="features">
                  <div className="feature">
                    <div className="feature-icon phone">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <div className="feature-text">
                      <h3>Keep your phone connected</h3>
                      <p>WhatsApp connects to your phone to sync messages seamlessly.</p>
                    </div>
                  </div>
                  
                  <div className="feature">
                    <div className="feature-icon globe">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div className="feature-text">
                      <h3>Browse privately</h3>
                      <p>WhatsApp Web is secured with end-to-end encryption.</p>
                    </div>
                  </div>
                  
                  <div className="feature">
                    <div className="feature-icon shield">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                      </svg>
                    </div>
                    <div className="feature-text">
                      <h3>Stay secure</h3>
                      <p>Your personal messages are protected with advanced security.</p>
                    </div>
                  </div>
                  
                  <div className="feature">
                    <div className="feature-icon lightning">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                      </svg>
                    </div>
                    <div className="feature-text">
                      <h3>Real-time messaging</h3>
                      <p>Messages sync instantly across all your devices.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


