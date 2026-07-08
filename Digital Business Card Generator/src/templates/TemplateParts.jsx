import { QRCodeSVG } from 'qrcode.react';
import { FaBuilding, FaEnvelope, FaLocationDot, FaPhone } from 'react-icons/fa6';
import { contactFields, socialLinks } from '../utils/cardFields';
import { getInitials, getQrTarget, normalizeUrl } from '../utils/links';

export function Avatar({ card, accentColor, size = 'lg', className = '' }) {
  const sizeClass = size === 'sm' ? 'h-20 w-20 text-xl' : 'h-28 w-28 text-3xl';

  return (
    <div
      className={`${sizeClass} grid shrink-0 place-items-center overflow-hidden rounded-lg border bg-black/25 font-black text-white ${className}`}
      style={{ borderColor: `${accentColor}66` }}
    >
      {card.profileImage ? (
        <img src={card.profileImage} alt="" className="h-full w-full object-cover" />
      ) : (
        <span style={{ color: accentColor }}>{getInitials(card.fullName) || 'DB'}</span>
      )}
    </div>
  );
}

export function CompanyLine({ card, className = '' }) {
  if (!card.company) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FaBuilding />
      <span>{card.company}</span>
    </div>
  );
}

export function ContactList({ card, accentColor, compact = false, className = '' }) {
  const rows = contactFields.filter((field) => card[field.key]);

  return (
    <div className={`grid gap-2 ${className}`}>
      {rows.map((field) => {
        const Icon = field.icon;
        const value = card[field.key];
        const href =
          field.key === 'phone'
            ? `tel:${value.replace(/\s/g, '')}`
            : field.hrefPrefix
              ? `${field.hrefPrefix}${value}`
              : field.key === 'website'
                ? normalizeUrl(value)
                : '';
        const content = (
          <>
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md"
              style={{ backgroundColor: `${accentColor}1f`, color: accentColor }}
            >
              <Icon />
            </span>
            <span className="truncate">{value}</span>
          </>
        );

        if (href) {
          return (
            <a
              key={field.key}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              className={`flex min-w-0 items-center gap-2 transition hover:opacity-80 ${
                compact ? 'text-xs' : 'text-sm'
              }`}
            >
              {content}
            </a>
          );
        }

        return (
          <div
            key={field.key}
            className={`flex min-w-0 items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

export function SocialIcons({ card, accentColor, variant = 'solid', className = '' }) {
  const links = socialLinks.filter((link) => card[link.key]);
  if (!links.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((link) => {
        const Icon = link.icon;
        const isSolid = variant === 'solid';

        return (
          <a
            key={link.key}
            href={normalizeUrl(card[link.key])}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
            className="grid h-10 w-10 place-items-center rounded-md border transition hover:-translate-y-0.5 hover:brightness-110"
            style={{
              backgroundColor: isSolid ? accentColor : `${accentColor}18`,
              borderColor: `${accentColor}55`,
              color: isSolid ? '#050807' : accentColor,
            }}
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}

export function QrBlock({ card, accentColor, dark = '#050807', label = 'Scan' }) {
  const target = getQrTarget(card);

  if (!target) return null;

  return (
    <div className="w-fit rounded-lg border border-white/10 bg-white p-2 text-black shadow-2xl">
      <QRCodeSVG
        value={target}
        size={96}
        bgColor="#ffffff"
        fgColor={dark}
        level="H"
        includeMargin={false}
      />
      <div className="mt-1 text-center text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: accentColor }}>
        {label}
      </div>
    </div>
  );
}

export function MiniContactStrip({ card, accentColor }) {
  const items = [
    { key: 'phone', icon: FaPhone },
    { key: 'email', icon: FaEnvelope },
    { key: 'address', icon: FaLocationDot },
  ].filter((item) => card[item.key]);

  return (
    <div className="flex flex-wrap gap-2 text-xs text-white/82">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <span key={item.key} className="flex items-center gap-1.5">
            <Icon style={{ color: accentColor }} />
            <span>{card[item.key]}</span>
          </span>
        );
      })}
    </div>
  );
}
