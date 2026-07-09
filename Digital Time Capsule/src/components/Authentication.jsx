import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiLock, FiMail, FiUserPlus } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Authentication() {
  const { loginGoogle, loginEmail, enterGuestMode, firebaseReady } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await loginEmail(email, password, isRegistering);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dark min-h-screen bg-vault-ink text-slate-50">
      <main className="particle-field flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-vault-accent/30 bg-vault-accent/10 px-3 py-1 text-sm font-medium text-vault-accent">
              <FiLock aria-hidden="true" />
              Encrypted future memories
            </div>
            <div className="max-w-2xl space-y-5">
              <h1 className="text-4xl font-extrabold leading-tight tracking-normal text-white sm:text-6xl">
                ChronoVault AI
              </h1>
              <p className="text-lg leading-8 text-slate-300">
                Preserve letters, media, documents, moods, and milestones in secure time capsules that open only when their moment arrives.
              </p>
            </div>
            <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
              {['Encrypted metadata', 'Live countdowns', 'Cloud media vault'].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-semibold text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="glass-panel rounded-lg p-5 sm:p-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Enter your vault</h2>
              <p className="mt-2 text-sm text-slate-300">
                Firebase login activates cloud sync. Guest mode keeps a polished local demo on this device.
              </p>
            </div>

            {!firebaseReady && (
              <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
                Add Firebase values to `.env` to enable Google and email authentication.
              </div>
            )}

            <form className="space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-200">Email</span>
                <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-200">Password</span>
                <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
              </label>
              {error && <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
              <button className="primary-button w-full" type="submit" disabled={busy || !firebaseReady}>
                <FiMail aria-hidden="true" />
                {isRegistering ? 'Create secure account' : 'Login with email'}
              </button>
            </form>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button className="secondary-button" type="button" onClick={() => setIsRegistering((value) => !value)}>
                <FiUserPlus aria-hidden="true" />
                {isRegistering ? 'Use login' : 'Register'}
              </button>
              <button className="secondary-button" type="button" disabled={!firebaseReady} onClick={loginGoogle}>
                <FcGoogle aria-hidden="true" />
                Google
              </button>
            </div>

            <button className="mt-4 w-full rounded-lg border border-vault-accent/30 bg-vault-accent/10 px-4 py-3 text-sm font-semibold text-vault-accent transition hover:bg-vault-accent hover:text-vault-ink" type="button" onClick={enterGuestMode}>
              Continue in guest mode
            </button>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
