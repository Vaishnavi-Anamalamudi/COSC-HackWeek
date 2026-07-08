import { Avatar, CompanyLine, ContactList, QrBlock, SocialIcons } from './TemplateParts';

export default function CorporateTemplate({ card, accentColor }) {
  return (
    <article className="relative h-[420px] w-[720px] overflow-hidden bg-[#f7faf8] p-0 text-[#0b1411]">
      <div className="grid h-full grid-cols-[245px_1fr]">
        <aside className="flex h-full flex-col justify-between bg-[#101816] p-7 text-white">
          <div>
            <Avatar card={card} accentColor={accentColor} className="shadow-xl" />
            <CompanyLine card={card} className="mt-6 text-sm font-semibold text-white/72" />
          </div>
          <QrBlock card={card} accentColor={accentColor} dark="#101816" label="Website" />
        </aside>

        <main className="flex min-w-0 flex-col justify-between p-8">
          <div>
            <div className="mb-6 h-1.5 w-24 rounded-full" style={{ backgroundColor: accentColor }} />
            <h2 className="max-w-[390px] truncate text-5xl font-black leading-none">
              {card.fullName || 'Your Name'}
            </h2>
            <p className="mt-3 text-xl font-bold text-[#34413c]">{card.designation || 'Your role'}</p>
          </div>

          <ContactList card={card} accentColor={accentColor} className="text-[#1e2b27]" />

          <div className="flex items-center justify-between gap-4">
            <p className="max-w-[240px] text-xs font-semibold uppercase tracking-[0.22em] text-[#5d6b66]">
              Print ready profile card
            </p>
            <SocialIcons card={card} accentColor={accentColor} />
          </div>
        </main>
      </div>
    </article>
  );
}
