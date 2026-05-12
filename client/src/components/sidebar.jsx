import { Menu, MoreVertical, Pin, Pencil, Share2, Trash2, Waves } from 'lucide-react';

export default function Sidebar({
  sessions, activeSessionId, setActiveSessionId,
  isSidebarOpen, setIsSidebarOpen,
  deleteChat, renameChat, pinChat, shareChat,
  activeMenuId, setActiveMenuId
}) {
  const sortedSessions = [...sessions].sort((a, b) => (b.isPinned === a.isPinned) ? 0 : b.isPinned ? 1 : -1);

  return (
    <aside
      className={`relative z-20 flex shrink-0 flex-col overflow-hidden border-r border-[rgb(var(--border))] bg-[rgb(var(--surface))] backdrop-blur-sm transition-[width] duration-300 ease-out ${isSidebarOpen ? 'w-[280px]' : 'w-[72px]'
        }`}
    >
      <button
        type="button"
        className="absolute right-2 top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-xl text-[rgb(var(--text-secondary))] transition hover:bg-[rgb(var(--surface-muted))] hover:text-[rgb(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]/50"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex h-[60px] shrink-0 items-center pl-4 pr-14 pt-1">
        {isSidebarOpen && (
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] shadow-md shadow-black/5">
              <Waves className="h-4 w-4 text-[rgb(var(--accent))]" aria-hidden />
            </span>
            <span className="truncate text-base font-semibold tracking-tight text-[rgb(var(--text))]">
              SpeakGrid AI
            </span>
          </div>
        )}
      </div>

      {isSidebarOpen && (
        <div className="px-3 pb-2">
          <p className="rounded-xl border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-3 py-2 text-xs text-[rgb(var(--text-muted))]">
            Conversations
          </p>
        </div>
      )}

      {isSidebarOpen && (
        <nav className="chat-scroll flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-4">
          {sortedSessions.map(session => (
            <div key={session.id} className="relative">
              <div
                onClick={() => { setActiveSessionId(session.id); setActiveMenuId(null); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveSessionId(session.id);
                    setActiveMenuId(null);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`group flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition ${session.id === activeSessionId
                  ? 'border border-[rgb(var(--accent-light))]/30 bg-[rgb(var(--surface-muted))] shadow-inner shadow-black/5'
                  : 'border border-transparent hover:bg-[rgb(var(--surface-muted))]'
                  }`}
              >
                <div className="min-w-0 flex-1 truncate text-sm text-[rgb(var(--text-secondary))]">
                  {session.isPinned && (
                    <Pin className="mr-1.5 inline-block h-3.5 w-3.5 shrink-0 text-[rgb(var(--accent-light))]/90" aria-hidden />
                  )}
                  <span className={session.isPinned ? 'font-medium' : 'font-normal'}>{session.title}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === session.id ? null : session.id); }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[rgb(var(--text-subtle))] opacity-70 transition hover:bg-[rgb(var(--surface-muted))] hover:text-[rgb(var(--text))] group-hover:opacity-100"
                  aria-label="Chat actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {activeMenuId === session.id && (
                <div className="absolute right-2 top-[calc(100%-4px)] z-50 min-w-[152px] overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] py-1 shadow-xl shadow-black/10 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={(e) => shareChat(session, e)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[rgb(var(--text-secondary))] transition hover:bg-[rgb(var(--surface-muted))]"
                  >
                    <Share2 className="h-4 w-4 text-[rgb(var(--text-subtle))]" aria-hidden />
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={(e) => renameChat(session.id, e)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[rgb(var(--text-secondary))] transition hover:bg-[rgb(var(--surface-muted))]"
                  >
                    <Pencil className="h-4 w-4 text-[rgb(var(--text-subtle))]" aria-hidden />
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={(e) => pinChat(session.id, e)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[rgb(var(--text-secondary))] transition hover:bg-[rgb(var(--surface-muted))]"
                  >
                    <Pin className="h-4 w-4 text-[rgb(var(--text-subtle))]" aria-hidden />
                    {session.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => deleteChat(session.id, e)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" aria-hidden />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </aside>
  );
}
