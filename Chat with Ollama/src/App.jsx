import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiMoon, FiSearch, FiSun, FiUser } from "react-icons/fi";
import ChatInput from "./components/ChatInput.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import ModelSelector from "./components/ModelSelector.jsx";
import Settings from "./components/Settings.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { useChatContext } from "./context/ChatContext.jsx";

export default function App() {
  const {
    activeConversation,
    searchQuery,
    setSearchQuery,
    settings,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen,
    settingsOpen,
    setSettingsOpen,
    ollamaStatus,
  } = useChatContext();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-studio-bg dark:text-studio-text">
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />

        <AnimatePresence>
          {sidebarOpen && (
            <motion.button
              aria-label="Close sidebar"
              className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 px-3 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-studio-bg/80 md:px-5">
            <div className="flex items-center gap-3">
              <button className="icon-button lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                <FiMenu />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-500">Ollama Studio AI</p>
                <h1 className="truncate text-lg font-semibold md:text-xl">
                  {activeConversation?.title || "Local AI assistant"}
                </h1>
              </div>

              <div className="hidden min-w-[220px] max-w-md flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 dark:border-white/10 dark:bg-white/5 md:flex">
                <FiSearch className="text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search chats and messages"
                />
              </div>

              <ModelSelector />

              <button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">
                {settings.theme === "dark" ? <FiSun /> : <FiMoon />}
              </button>

              <button className="profile-button" onClick={() => setSettingsOpen(true)} aria-label="Open settings">
                <FiUser />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 md:hidden">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <FiSearch className="text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search"
                />
              </div>
              <span className={`status-pill ${ollamaStatus.ok ? "status-online" : "status-offline"}`}>
                {ollamaStatus.ok ? "Online" : "Offline"}
              </span>
            </div>
          </header>

          <ChatWindow />
          <ChatInput />
        </main>
      </div>

      <AnimatePresence>{settingsOpen && <Settings />}</AnimatePresence>
    </div>
  );
}
