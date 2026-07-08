import { useState } from 'react';
import { FiMic, FiPlus, FiRepeat, FiSave, FiUploadCloud, FiX } from 'react-icons/fi';

const blankForm = {
  type: 'expense',
  title: '',
  amount: '',
  category: 'Food',
  account: '',
  date: new Date().toISOString().slice(0, 10),
  note: '',
  recurring: false,
  receipt: '',
};

export default function ExpenseForm({
  categories,
  accounts,
  onSubmit,
  editingTransaction,
  onCancelEdit,
}) {
  const [form, setForm] = useState(() => editingTransaction || blankForm);
  const [voiceActive, setVoiceActive] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || Number(form.amount) <= 0) return;
    onSubmit({ ...form, title: form.title.trim() });
    setForm(blankForm);
  }

  function handleReceipt(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField('receipt', reader.result);
    reader.readAsDataURL(file);
  }

  function startVoiceEntry() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setVoiceActive(true);
    recognition.onend = () => setVoiceActive(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setForm((current) => ({ ...current, note: transcript, title: current.title || transcript }));
    };
    recognition.start();
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-frost">
            {editingTransaction ? 'Edit transaction' : 'Add transaction'}
          </h2>
          <p className="text-sm text-slate-400">Income, expenses, receipts, and recurring costs</p>
        </div>
        {editingTransaction && (
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300"
            onClick={() => {
              setForm(blankForm);
              onCancelEdit();
            }}
            type="button"
            aria-label="Cancel edit"
          >
            <FiX />
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Type</span>
          <select
            className="field"
            value={form.type}
            onChange={(event) => updateField('type', event.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Amount</span>
          <input
            className="field"
            type="number"
            min="1"
            value={form.amount}
            onChange={(event) => updateField('amount', event.target.value)}
            placeholder="0"
          />
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-slate-300">Title</span>
          <input
            className="field"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Coffee, salary, SIP..."
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Category</span>
          <select
            className="field"
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Account</span>
          <select
            className="field"
            value={form.account}
            onChange={(event) => updateField('account', event.target.value)}
          >
            <option value="">Select account</option>
            {accounts.map((account) => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Date</span>
          <input
            className="field"
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-slate-300">Receipt</span>
          <span className="field flex cursor-pointer items-center justify-between">
            <span className="truncate text-slate-400">{form.receipt ? 'Receipt attached' : 'Upload image'}</span>
            <FiUploadCloud />
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(event) => handleReceipt(event.target.files[0])}
            />
          </span>
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-slate-300">Note</span>
          <textarea
            className="field min-h-24 resize-none"
            value={form.note}
            onChange={(event) => updateField('note', event.target.value)}
            placeholder="Add a note or use voice entry"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium ${
            form.recurring
              ? 'border-mint bg-mint/15 text-mint'
              : 'border-white/10 text-slate-300'
          }`}
          onClick={() => updateField('recurring', !form.recurring)}
          type="button"
        >
          <FiRepeat />
          Recurring
        </button>
        <button
          className={`inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium ${
            voiceActive ? 'text-mint' : 'text-slate-300'
          }`}
          onClick={startVoiceEntry}
          type="button"
          title="Voice expense entry"
        >
          <FiMic />
          Voice
        </button>
        <button className="btn-primary ml-auto" type="submit">
          {editingTransaction ? <FiSave /> : <FiPlus />}
          {editingTransaction ? 'Save changes' : 'Add transaction'}
        </button>
      </div>
    </form>
  );
}
