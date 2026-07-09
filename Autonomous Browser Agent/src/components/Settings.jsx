import { FiCpu, FiShield } from 'react-icons/fi';

export default function Settings({ connection }) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="mb-4 flex items-center gap-2">
        <FiCpu className="text-pilot-green" />
        <h2 className="text-lg font-semibold text-pilot-text">Settings</h2>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-lg border border-pilot-line bg-white/5 p-3">
          <span className="text-pilot-muted">WebSocket</span>
          <span className={connection === 'connected' ? 'text-pilot-green' : 'text-amber-200'}>
            {connection}
          </span>
        </div>
        <div className="rounded-lg border border-pilot-line bg-white/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-pilot-text">
            <FiShield className="text-pilot-green" />
            Human-in-the-loop safety
          </div>
          <p className="text-pilot-muted">
            CAPTCHA or sensitive flows are surfaced for manual resolution instead of bypassed.
          </p>
        </div>
      </div>
    </section>
  );
}
