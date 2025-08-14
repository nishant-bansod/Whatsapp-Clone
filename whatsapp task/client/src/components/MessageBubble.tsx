import clsx from 'clsx';

export function MessageBubble({ direction, text, timestamp, status }: {
  direction: 'inbound' | 'outbound';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'unknown' | 'none';
}) {
  const isOutbound = direction === 'outbound';
  const ticks = isOutbound
    ? status === 'read'
      ? '✓✓'
      : status === 'delivered'
      ? '✓✓'
      : status === 'sent'
      ? '✓'
      : ''
    : '';

  return (
    <div
      className={clsx(
        'bubble',
        isOutbound ? 'outbound' : 'inbound'
      )}
    >
      <div>{text}</div>
      <div className="meta">
        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {isOutbound ? ticks : ''}
      </div>
    </div>
  );
}


