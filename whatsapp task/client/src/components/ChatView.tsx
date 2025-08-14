import { useMemo, useRef, useState, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';

export function ChatView({ waId, messages, onSend }: {
  waId: string;
  messages: any[];
  onSend: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const title = useMemo(() => messages?.[messages.length - 1]?.contactName || waId, [messages, waId]);

  async function handleSend() {
    if (!text.trim()) return;
    const t = text;
    setText('');
    await onSend(t);
  }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <div className="chat-title">{title}</div>
        <div className="chat-sub">{waId}</div>
      </div>
      <div className="chat-messages" ref={listRef}>
        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            direction={m.direction}
            text={m.text}
            timestamp={m.timestamp}
            status={m.status}
          />
        ))}
      </div>
      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}


