import { useState } from 'react';
import { FiDownload, FiPlus, FiUploadCloud } from 'react-icons/fi';
import { CURRENCIES } from '../constants/categories';
import { downloadCsv } from '../utils/helpers';

export default function Settings({
  budgetState,
  setCurrencyCode,
  addAccount,
  transactions,
  importSharedTransaction,
}) {
  const [account, setAccount] = useState('');
  const [payload, setPayload] = useState('');

  function submitAccount(event) {
    event.preventDefault();
    addAccount(account.trim());
    setAccount('');
  }

  function importPayload(event) {
    event.preventDefault();
    if (!payload.trim()) return;
    importSharedTransaction(payload.trim());
    setPayload('');
  }

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <article className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-frost">Preferences</h2>
        <label className="mt-5 block space-y-2">
          <span className="text-sm text-slate-300">Currency</span>
          <select
            className="field"
            value={budgetState.currencyCode}
            onChange={(event) => setCurrencyCode(event.target.value)}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} ({currency.symbol})
              </option>
            ))}
          </select>
        </label>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-300">Accounts</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {budgetState.accounts.map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                {item}
              </span>
            ))}
          </div>
        </div>

        <form className="mt-5 flex gap-3" onSubmit={submitAccount}>
          <input
            className="field"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            placeholder="Add account"
          />
          <button className="btn-primary shrink-0" type="submit">
            <FiPlus />
            Add
          </button>
        </form>
      </article>

      <article className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-frost">Data tools</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button className="btn-secondary justify-center" onClick={() => downloadCsv(transactions)} type="button">
            <FiDownload />
            Export CSV
          </button>
          <button
            className="btn-secondary justify-center"
            onClick={() => localStorage.setItem('fintrack-ai-backup', JSON.stringify(transactions))}
            type="button"
          >
            <FiUploadCloud />
            Backup
          </button>
        </div>

        <form className="mt-6" onSubmit={importPayload}>
          <label className="space-y-2">
            <span className="text-sm text-slate-300">QR/share payload</span>
            <textarea
              className="field min-h-28 resize-none"
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              placeholder="Paste copied FinTrack AI payload"
            />
          </label>
          <button className="btn-primary mt-4" type="submit">
            <FiPlus />
            Import transaction
          </button>
        </form>
      </article>
    </section>
  );
}
