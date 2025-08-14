import clsx from 'clsx';

export function ConversationsList({ conversations, selectedWaId, onSelect }: {
  conversations: any[];
  selectedWaId: string | null;
  onSelect: (waId: string) => void;
}) {
  return (
    <div className="convo-list">
      {conversations.map((c) => (
        <button
          key={c.waId}
          className={clsx('convo-item', selectedWaId === c.waId && 'active')}
          onClick={() => onSelect(c.waId)}
        >
          <div className="convo-title">{c.contactName || c.waId}</div>
          <div className="convo-sub">
            <span className="convo-last">{c.lastType === 'text' ? c.lastMessage : c.lastType}</span>
            <span className="convo-time">{c.lastTimestamp ? new Date(c.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
        </button>
      ))}
    </div>
  );
}


