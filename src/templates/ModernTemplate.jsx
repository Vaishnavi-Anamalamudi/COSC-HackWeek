import { Avatar, CompanyLine, ContactList, QrBlock, SocialIcons } from './TemplateParts';

export default function ModernTemplate({ card, accentColor }) {
  return (
    <article className="relative h-[420px] w-[720px] overflow-hidden bg-[#07100d] p-8 text-white">
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: accentColor }} />
      <div
        className="absolute -right-28 -top-28 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: accentColor }}
      />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-8">
          <div className="flex min-w-0 gap-5">
            <Avatar card={card} accentColor={accentColor} />
            <div className="min-w-0 pt-2">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.32em]" style={{ color: accentColor }}>
                Digital Card
              </p>
              <h2 className="max-w-[360px] truncate text-5xl font-black leading-none text-white">
                {card.fullName || 'Your Name'}
              </h2>
              <p className="mt-3 text-xl font-semibold text-zinc-200">
                {card.designation || 'Your role'}
              </p>
              <CompanyLine card={card} className="mt-2 text-sm font-medium text-zinc-400" />
            </div>
          </div>
          <QrBlock card={card} accentColor={accentColor} />
        </div>

        <div className="grid grid-cols-[1fr_auto] items-end gap-8">
          <ContactList card={card} accentColor={accentColor} className="text-zinc-200" />
          <SocialIcons card={card} accentColor={accentColor} />
        </div>
      </div>
    </article>
  );
}
