import { motion } from "framer-motion";
import { FiMessageSquare, FiPlus, FiSearch, FiStar, FiTrash2 } from "react-icons/fi";
import { useChatContext } from "../context/ChatContext.jsx";
import { createConversation } from "../services/chatStorage.js";

export default function Sidebar() {
  const {
    conversations,
    activeId,
    setActiveId,
    setConversations,
    updateConversation,
    newChat,
    searchQuery,
    setSearchQuery,
    sidebarOpen,
    setSidebarOpen,
  } = useChatContext();

  const query = searchQuery.trim().toLowerCase();
  const filteredConversations = conversations
    .filter((conversation) => {
      if (!query) return true;
      const titleMatch = conversation.title.toLowerCase().includes(query);
      const messageMatch = conversation.messages.some((message) => message.content.toLowerCase().includes(query));
      return titleMatch || messageMatch;
    })
    .sort((first, second) => Number(second.pinned) - Number(first.pinned));

  function startChat() {
    newChat();
    setSidebarOpen(false);
  }

  function openChat(id) {
    setActiveId(id);
    setSidebarOpen(false);
  }

  function toggleFavorite(event, conversation) {
    event.stopPropagation();
    updateConversation(conversation.id, (current) => ({ ...current, favorite: !current.favorite }));
  }

  function deleteChat(event, id) {
    event.stopPropagation();
    if (!confirm("Delete this chat?")) return;

    setConversations((current) => {
      const next = current.filter((conversation) => conversation.id !== id);
      if (next.length) {
        if (id === activeId) setActiveId(next[0].id);
        return next;
      }

      const replacement = createConversation();
      setActiveId(replacement.id);
      return [replacement];
    });
  }

  return (
    <motion.aside
      className={`fixed inset-y-0 left-0 z-40 flex w-80 max-w-[86vw] flex-col border-r border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-studio-sidebar lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      initial={false}
      animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : "-100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
    >
      <div className="border-b border-slate-200 p-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-lg font-black text-slate-950">
            OS
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black">Ollama Studio</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Local chat history</p>
          </div>
        </div>

        <button className="primary-button mt-4 w-full" onClick={startChat}>
          <FiPlus /> New chat
        </button>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 dark:border-white/10 dark:bg-white/5">
          <FiSearch className="shrink-0 text-slate-400" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search chats"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {filteredConversations.length ? (
          <div className="grid gap-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`group rounded-lg border p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-500/10 ${
                  conversation.id === activeId
                    ? "border-emerald-400 bg-emerald-500/15"
                    : "border-transparent bg-slate-100/70 dark:bg-white/[0.04]"
                }`}
                onClick={() => openChat(conversation.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-500 dark:bg-white/10">
                    <FiMessageSquare />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold">{conversation.title}</p>
                      {conversation.pinned ? <span className="status-pill status-online">Pinned</span> : null}
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      {conversation.messages.length} messages
                    </p>
                  </div>
                  <div className="flex shrink-0 opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100">
                    <button
                      className={`icon-button h-8 w-8 border-0 shadow-none ${
                        conversation.favorite ? "text-amber-400" : ""
                      }`}
                      onClick={(event) => toggleFavorite(event, conversation)}
                      aria-label="Toggle favorite"
                    >
                      <FiStar />
                    </button>
                    <button
                      className="icon-button h-8 w-8 border-0 text-rose-500 shadow-none"
                      onClick={(event) => deleteChat(event, conversation.id)}
                      aria-label="Delete chat"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            No chats match your search.
          </div>
        )}
      </div>
    </motion.aside>
  );
}
