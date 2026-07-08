import { Avatar, MiniContactStrip, QrBlock, SocialIcons } from './TemplateParts';

export default function CyberpunkTemplate({ card, accentColor }) {
  return (
    <article className="relative h-[420px] w-[720px] overflow-hidden bg-[#08070d] p-8 text-white">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-fuchsia-300/70" />
      <div className="absolute inset-y-0 right-0 w-px bg-cyan-300/70" />
      <div
        className="absolute -right-20 bottom-8 h-56 w-56 rounded-full opacity-35 blur-3xl"
        style={{ backgroundColor: accentColor }}
      />
      <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/18 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col justify-between border border-white/15 bg-black/36 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 gap-5">
            <Avatar card={card} accentColor={accentColor} className="shadow-[0_0_32px_rgba(34,197,94,0.32)]" />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.34em] text-cyan-200">
                Verified Identity
              </p>
              <h2
                className="mt-3 max-w-[390px] truncate text-5xl font-black uppercase leading-none"
                style={{ textShadow: `0 0 22px ${accentColor}66` }}
              >
                {card.fullName || 'Your Name'}
              </h2>
              <p className="mt-3 text-xl font-bold" style={{ color: accentColor }}>
                {card.designation || 'Your role'}
              </p>
              {card.company && <p className="mt-1 text-sm text-fuchsia-100/75">{card.company}</p>}
            </div>
          </div>
          <QrBlock card={card} accentColor={accentColor} dark="#08070d" label="Link" />
        </div>

        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <MiniContactStrip card={card} accentColor={accentColor} />
            {card.website && <p className="mt-4 truncate text-sm text-cyan-100/80">{card.website}</p>}
          </div>
          <SocialIcons card={card} accentColor={accentColor} variant="outline" />
        </div>
      </div>
    </article>
  );
}
