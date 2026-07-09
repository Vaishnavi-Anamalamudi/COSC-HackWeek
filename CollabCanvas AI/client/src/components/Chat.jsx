import { useEffect, useRef, useState } from 'react';
import { FiSend, FiSmile } from 'react-icons/fi';

const emojis = ['👍', '🔥', '✨', '✅', '💡', '🎯'];

export default function Chat({ user, messages, typingUsers, onSend, onTyping }) {
  const [draft, setDraft] = useState('');
  const endRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function updateDraft(value) {
    setDraft(value);
    onTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping(false), 900);
  }

  function submit(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend({
      id: crypto.randomUUID(),
      userId: user.id,
      name: user.name,
      color: user.color,
      text,
      createdAt: new Date().toISOString()
    });
    setDraft('');
    onTyping(false);
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <h2 className="mb-3 text-sm font-semibold text-white">Team Chat</h2>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {messages.map((message) => {
          const own = message.userId === user.id;
          return (
            <div className={`flex ${own ? 'justify-end' : 'justify-start'}`} key={message.id}>
              <div className={`max-w-[86%] rounded-2xl px-3 py-2 ${own ? 'bg-accent text-ink' : 'bg-slate-900 text-slate-100'}`}>
                <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                  {!own && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: message.color }} />}
                  <span>{own ? 'You' : message.name}</span>
                </div>
                <p className="break-words text-sm">{message.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {typingUsers.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">{typingUsers.map((item) => item.name).join(', ')} typing...</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1">
        {emojis.map((emoji) => (
          <button className="rounded-lg bg-slate-900 px-2 py-1 text-sm" key={emoji} type="button" onClick={() => updateDraft(`${draft}${emoji}`)}>
            {emoji}
          </button>
        ))}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={submit}>
        <input className="field min-w-0 flex-1" value={draft} placeholder="Message" onChange={(event) => updateDraft(event.target.value)} />
        <button className="icon-button bg-accent text-ink hover:bg-emerald-300 hover:text-ink" type="submit" aria-label="Send message" title="Send message">
          <FiSend />
        </button>
        <button className="icon-button" type="button" aria-label="Emoji" title="Emoji" onClick={() => updateDraft(`${draft}✨`)}>
          <FiSmile />
        </button>
      </form>
    </section>
  );
}
