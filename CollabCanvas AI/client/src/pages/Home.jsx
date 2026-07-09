import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuid } from 'uuid';
import { FiArrowRight, FiClock, FiLink, FiPlus, FiUsers } from 'react-icons/fi';
import { getRoomHistory } from '../utils/roomHistory.js';
import { USER_KEY } from '../constants/tools.js';

const palette = ['#22C55E', '#38BDF8', '#A78BFA', '#F97316', '#EC4899'];

function readUser() {
  try {
    const saved = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    if (saved?.name) return saved;
  } catch {
    return null;
  }
  return {
    id: uuid(),
    name: `Guest ${Math.floor(Math.random() * 900 + 100)}`,
    color: palette[Math.floor(Math.random() * palette.length)]
  };
}

export default function Home({ navigate }) {
  const [user, setUser] = useState(readUser);
  const [joinRoom, setJoinRoom] = useState('');
  const history = useMemo(() => getRoomHistory(), []);

  function persistUser(nextUser = user) {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    return nextUser;
  }

  function createRoom() {
    persistUser();
    navigate(`/room/${uuid()}`);
  }

  function joinExisting(roomId = joinRoom) {
    const id = roomId.trim();
    if (!id) return;
    persistUser();
    navigate(`/room/${id}`);
  }

  function demoRoom() {
    persistUser();
    navigate('/room/demo-judges-room');
  }

  return (
    <main className="h-screen overflow-auto bg-ink text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 canvas-shell opacity-95" />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-xl font-black text-ink">C</div>
              <div>
                <p className="text-lg font-bold">CollabCanvas AI</p>
                <p className="text-xs text-slate-400">Real-time collaborative whiteboard</p>
              </div>
            </div>
            <button className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-soft sm:block" type="button" onClick={demoRoom}>
              Demo room
            </button>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-normal sm:text-6xl lg:text-7xl">CollabCanvas AI</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                A low-latency room-based canvas for sketches, sticky notes, diagrams, live cursors, chat, exports, autosave, and hackathon-ready demos.
              </p>

              <div className="mt-8 grid max-w-xl gap-3 rounded-3xl border border-white/10 bg-slate-950/55 p-4 shadow-glow backdrop-blur sm:grid-cols-[1fr_auto]">
                <input
                  className="field h-12"
                  value={user.name}
                  onChange={(event) => setUser((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                />
                <div className="flex gap-2">
                  {palette.map((color) => (
                    <button
                      className={`h-12 w-12 rounded-2xl border-2 ${user.color === color ? 'border-white' : 'border-transparent'}`}
                      key={color}
                      type="button"
                      style={{ backgroundColor: color }}
                      onClick={() => setUser((current) => ({ ...current, color }))}
                      aria-label={color}
                    />
                  ))}
                </div>
                <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 font-bold text-ink" type="button" onClick={createRoom}>
                  <FiPlus /> Create room
                </button>
                <button className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-600 px-5 font-semibold text-white" type="button" onClick={demoRoom}>
                  <FiUsers /> Demo
                </button>
                <div className="sm:col-span-2 flex gap-2">
                  <input className="field h-12 min-w-0 flex-1" value={joinRoom} placeholder="Paste Room ID or invite link" onChange={(event) => setJoinRoom(event.target.value.split('/room/').pop())} />
                  <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 font-bold text-slate-950" type="button" onClick={() => joinExisting()}>
                    <FiArrowRight /> Join
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div className="relative min-h-[520px]" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 }}>
              <div className="absolute inset-0 rounded-[2rem] bg-white shadow-glow">
                <div className="h-full rounded-[2rem] canvas-shell p-7">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="h-3 w-3 rounded-full bg-rose-400" />
                      <span className="h-3 w-3 rounded-full bg-amber-300" />
                      <span className="h-3 w-3 rounded-full bg-accent" />
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">live</span>
                  </div>
                  <div className="relative h-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <div className="absolute left-16 top-16 h-28 w-52 rotate-[-3deg] rounded-2xl bg-yellow-200 p-5 text-slate-900 shadow-soft">Launch plan<br />✓ realtime<br />✓ export<br />✓ chat</div>
                    <div className="absolute left-80 top-24 h-24 w-40 rounded-full border-4 border-emerald-500" />
                    <div className="absolute left-48 top-[260px] h-1 w-80 rotate-[-12deg] rounded-full bg-blue-500" />
                    <div className="absolute right-16 top-48 h-36 w-52 rounded-2xl border-4 border-fuchsia-500" />
                    <div className="absolute bottom-10 right-32 rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-white">Vaish</div>
                    <div className="absolute bottom-32 left-52 rounded-full bg-blue-500 px-3 py-2 text-sm font-semibold text-white">Judge</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid gap-3 pb-8 md:grid-cols-3">
            {['Instant strokes and cursors', 'Built-in chat and presence', 'PNG, JPEG, PDF exports'].map((feature) => (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur" key={feature}>
                <p className="font-semibold">{feature}</p>
              </div>
            ))}
          </div>

          {history.length > 0 && (
            <div className="pb-10">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
                <FiClock /> Room history
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((item) => (
                  <button className="rounded-full border border-slate-600 px-3 py-2 text-sm text-slate-300" key={item.roomId} type="button" onClick={() => joinExisting(item.roomId)}>
                    <FiLink className="mr-2 inline" />
                    {item.roomId.slice(0, 18)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
