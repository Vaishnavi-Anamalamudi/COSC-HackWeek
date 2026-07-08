import { Avatar, CompanyLine, ContactList, QrBlock, SocialIcons } from './TemplateParts';

export default function GlassTemplate({ card, accentColor }) {
  return (
    <article className="relative h-[420px] w-[720px] overflow-hidden bg-[#0d1117] p-8 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.02))]" />
      <div
        className="absolute -left-24 bottom-4 h-60 w-60 rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: accentColor }}
      />
      <div className="absolute right-0 top-0 h-full w-1/2 bg-cyan-400/10 blur-2xl" />

      <div className="relative z-10 grid h-full grid-cols-[1fr_190px] gap-6 rounded-lg border border-white/16 bg-white/[0.075] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex min-w-0 flex-col justify-between">
          <div className="flex gap-4">
            <Avatar card={card} accentColor={accentColor} size="sm" className="bg-white/10" />
            <div className="min-w-0">
              <h2 className="truncate text-4xl font-black leading-tight">{card.fullName || 'Your Name'}</h2>
              <p className="text-lg font-semibold" style={{ color: accentColor }}>
                {card.designation || 'Your role'}
              </p>
              <CompanyLine card={card} className="mt-2 text-sm text-white/68" />
            </div>
          </div>

          <ContactList card={card} accentColor={accentColor} compact className="text-white/82" />
        </div>

        <div className="flex flex-col items-end justify-between">
          <QrBlock card={card} accentColor={accentColor} dark="#0d1117" label="Connect" />
          <SocialIcons card={card} accentColor={accentColor} variant="outline" className="justify-end" />
        </div>
      </div>
    </article>
  );
}
