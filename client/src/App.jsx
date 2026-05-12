import { useState, useRef, useEffect } from 'react';
import { SignedIn, SignedOut, SignIn, UserButton, useAuth } from "@clerk/clerk-react";
import { Plus, Volume2, VolumeX, Waves, Sun, Moon } from 'lucide-react';
import Sidebar from './components/sidebar';
import ChatArea from './components/ChatArea';
import InputBar from './components/InputBar';
import WorkspacePanel from './components/WorkspacePanel';
import { useTheme } from './contexts/ThemeContext';

const DEFAULT_TARGET_LANGUAGE = 'Auto';
const DEFAULT_OUTPUT_MODE = 'default';

export default function App() {
  const { getToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('speakgrid_sessions');
    if (saved) return JSON.parse(saved);
    return [{ id: Date.now(), title: 'New Chat', messages: [], isPinned: false }];
  });

  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id || null);

  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState(() => sessionStorage.getItem('target_language') || DEFAULT_TARGET_LANGUAGE);
  const [outputMode, setOutputMode] = useState(() => sessionStorage.getItem('output_mode') || DEFAULT_OUTPUT_MODE);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isAutoAudioEnabled, setIsAutoAudioEnabled] = useState(true);

  const [copiedId, setCopiedId] = useState(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editDraft, setEditDraft] = useState('');

  const [renameModal, setRenameModal] = useState({ isOpen: false, id: null, draftTitle: '' });

  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('speakgrid_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    sessionStorage.setItem('target_language', targetLanguage);
  }, [targetLanguage]);

  useEffect(() => {
    sessionStorage.setItem('output_mode', outputMode);
  }, [outputMode]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handleEnded = () => { setIsAudioPlaying(false); setPlayingAudioId(null); };
    const handlePause = () => setIsAudioPlaying(false);
    const handlePlay = () => setIsAudioPlaying(true);

    audioEl.addEventListener('ended', handleEnded);
    audioEl.addEventListener('pause', handlePause);
    audioEl.addEventListener('play', handlePlay);

    return () => {
      audioEl.removeEventListener('ended', handleEnded);
      audioEl.removeEventListener('pause', handlePause);
      audioEl.removeEventListener('play', handlePlay);
    };
  }, []);

  const togglePlayMessage = (fileName) => {
    if (!fileName || !audioRef.current) return;

    const fullUrl = `${import.meta.env.VITE_API_URL}/audio/${fileName}`;

    if (playingAudioId === fileName) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Play error:", e));
        setIsAudioPlaying(true);
      } else {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    } else {
      audioRef.current.src = fullUrl;
      setPlayingAudioId(fileName);
      setIsAudioPlaying(true);
      audioRef.current.play().catch(e => {
        console.error("Playback failed. Backend might be asleep or URL is dead.", e);
        setIsAudioPlaying(false);
      });
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResubmitEdit = async (index, newText) => {
    setEditingMessageIndex(null);
    if (!newText.trim()) return;

    const sessionToUpdate = sessions.find(s => s.id === activeSessionId);
    const updatedMessages = sessionToUpdate.messages.slice(0, index + 1);
    updatedMessages[index].text = newText;

    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: updatedMessages } : s));
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', newText);
      formData.append('sessionId', activeSessionId.toString());
      formData.append('targetLanguage', targetLanguage);
      formData.append('outputMode', outputMode);
      const token = await getToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      const data = await response.json();

      setSessions(prev => prev.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, {
              role: 'assistant',
              text: data.reply,
              reply: data.reply,
              speechReadyReply: data.speechReadyReply,
              translatedReply: data.translatedReply,
              outputMode: data.outputMode,
              targetLanguage: data.targetLanguage,
              audioUrl: data.audioUrl,
              audioFileName: data.fileName
            }]
          };
        }
        return session;
      }));

      if (data.fileName && isAutoAudioEnabled && audioRef.current) {
        const fullUrl = `${import.meta.env.VITE_API_URL}/audio/${data.fileName}`;
        audioRef.current.src = fullUrl;
        setPlayingAudioId(data.fileName);
        setIsAudioPlaying(true);
        audioRef.current.play().catch(e => console.error("Audio block:", e));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    const newSession = { id: Date.now(), title: 'New Chat', messages: [], isPinned: false };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setActiveMenuId(null);
  };

  const deleteChat = async (id, e) => {
    e.stopPropagation();
    const sessionToDelete = sessions.find(s => s.id === id);
    const audioFilesToDelete = sessionToDelete.messages.filter(msg => msg.audioFileName).map(msg => msg.audioFileName);

    const updatedSessions = sessions.filter(s => s.id !== id);
    if (updatedSessions.length === 0) {
      const newSession = { id: Date.now(), title: 'New Chat', messages: [], isPinned: false };
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    } else {
      setSessions(updatedSessions);
      if (activeSessionId === id) setActiveSessionId(updatedSessions[0].id);
    }
    setActiveMenuId(null);

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/session/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: id, audioFiles: audioFilesToDelete }) });
    } catch (err) { console.error("Failed to delete backend files:", err); }
  };

  const renameChat = (id, e) => {
    e.stopPropagation();
    const sessionToRename = sessions.find(s => s.id === id);
    setRenameModal({ isOpen: true, id: id, draftTitle: sessionToRename ? sessionToRename.title : '' });
    setActiveMenuId(null);
  };

  const saveRename = () => {
    if (renameModal.draftTitle.trim()) {
      setSessions(sessions.map(s => s.id === renameModal.id ? { ...s, title: renameModal.draftTitle } : s));
    }
    setRenameModal({ isOpen: false, id: null, draftTitle: '' });
  };

  const pinChat = (id, e) => {
    e.stopPropagation();
    setSessions(sessions.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s));
    setActiveMenuId(null);
  };

  const shareChat = (session, e) => {
    e.stopPropagation();
    const textToShare = session.messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
    navigator.clipboard.writeText(textToShare);
    alert("Chat transcript copied to clipboard!");
    setActiveMenuId(null);
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else { setPreviewUrl(null); }
  }, [file]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    const userMessage = input;
    const attachedFile = file;
    const currentPreview = previewUrl;

    setInput(''); setFile(null); setIsLoading(true);

    setSessions(prevSessions => prevSessions.map(session => {
      if (session.id === activeSessionId) {
        const isFirstMessage = session.messages.length === 0;
        const newTitle = isFirstMessage && userMessage ? userMessage.substring(0, 25) + '...' : session.title;
        return { ...session, title: newTitle, messages: [...session.messages, { role: 'user', text: userMessage || "Sent an attachment.", fileName: attachedFile?.name, previewUrl: currentPreview }] };
      }
      return session;
    }));

    try {
      const formData = new FormData();
      formData.append('message', userMessage);
      formData.append('sessionId', activeSessionId.toString());
      formData.append('targetLanguage', targetLanguage);
      formData.append('outputMode', outputMode);
      if (attachedFile) formData.append('attachment', attachedFile);
      const token = await getToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      const data = await response.json();

      setSessions(prevSessions => prevSessions.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, {
              role: 'assistant',
              text: data.reply,
              reply: data.reply,
              speechReadyReply: data.speechReadyReply,
              translatedReply: data.translatedReply,
              outputMode: data.outputMode,
              targetLanguage: data.targetLanguage,
              audioUrl: data.audioUrl,
              audioFileName: data.fileName
            }]
          };
        }
        return session;
      }));

      if (data.fileName && isAutoAudioEnabled && audioRef.current) {
        const fullUrl = `${import.meta.env.VITE_API_URL}/audio/${data.fileName}`;
        audioRef.current.src = fullUrl;
        setPlayingAudioId(data.fileName);
        setIsAudioPlaying(true);
        audioRef.current.play().catch(e => console.error("Audio block:", e));
      }

    } catch (error) {
      console.error(error);
      setSessions(prevSessions => prevSessions.map(session => {
        if (session.id === activeSessionId) return { ...session, messages: [...session.messages, { role: 'assistant', text: "Sorry, I'm offline right now." }] };
        return session;
      }));
    } finally { setIsLoading(false); }
  };

  return (
    <>
      <SignedOut>
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[rgb(var(--bg))] px-4 py-10 text-left">
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-1 shadow-2xl shadow-black/10 backdrop-blur-xl">
            <div className="rounded-[calc(1rem-2px)] border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] shadow-lg shadow-black/5">
                    <Waves className="h-5 w-5 text-[rgb(var(--accent))]" aria-hidden />
                  </div>
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-[rgb(var(--text))]">SpeakGrid AI</p>
                    <p className="text-sm text-[rgb(var(--text-muted))]">Voice assistant — sign in to continue</p>
                  </div>
                </div>
              <SignIn />
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="relative flex h-screen w-full overflow-hidden bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
          <Sidebar
            sessions={sessions} activeSessionId={activeSessionId} setActiveSessionId={setActiveSessionId}
            isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
            deleteChat={deleteChat} renameChat={renameChat} pinChat={pinChat} shareChat={shareChat}
            activeMenuId={activeMenuId} setActiveMenuId={setActiveMenuId}
          />

          <div
            className="relative z-10 flex min-w-0 flex-1 flex-col"
            onClick={() => setActiveMenuId(null)}
            onKeyDown={(e) => e.key === 'Escape' && setActiveMenuId(null)}
            role="presentation"
          >

            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-3 backdrop-blur-xl sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-lg font-semibold tracking-tight text-[rgb(var(--text))] sm:text-xl">
                  SpeakGrid AI
                </span>
                <span className="hidden rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[rgb(var(--text-muted))] sm:inline">
                  Workspace
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={createNewChat}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-3 py-2 text-sm font-medium text-[rgb(var(--text))] transition hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--surface-muted))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] sm:px-4"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">New chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAutoAudioEnabled(!isAutoAudioEnabled)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] sm:px-4 ${isAutoAudioEnabled
                    ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent-light))]/25 focus-visible:ring-[rgb(var(--accent))]'
                    : 'border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface-muted))] focus-visible:ring-[rgb(var(--text-muted))]'
                    }`}
                >
                  {isAutoAudioEnabled ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
                  <span className="hidden sm:inline">{isAutoAudioEnabled ? 'Auto play' : 'Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--text-secondary))] transition hover:bg-[rgb(var(--surface-muted))] hover:text-[rgb(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]"
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
                </button>

                <div className="flex items-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] p-0.5 pl-1">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </header>

            <ChatArea
              activeSession={activeSession} isLoading={isLoading}
              togglePlayMessage={togglePlayMessage} playingAudioId={playingAudioId} isAudioPlaying={isAudioPlaying}
              messagesEndRef={messagesEndRef} handleCopy={handleCopy} copiedId={copiedId}
              editingMessageIndex={editingMessageIndex} setEditingMessageIndex={setEditingMessageIndex}
              editDraft={editDraft} setEditDraft={setEditDraft} handleResubmitEdit={handleResubmitEdit}
              onQuickPrompt={handleQuickPrompt}
            />

            <InputBar
              input={input} setInput={setInput} file={file} setFile={setFile}
              outputMode={outputMode} setOutputMode={setOutputMode}
              targetLanguage={targetLanguage} setTargetLanguage={setTargetLanguage}
              previewUrl={previewUrl} isLoading={isLoading} sendMessage={sendMessage}
            />

            <audio ref={audioRef} className="hidden" />
          </div>

          <WorkspacePanel
            targetLanguage={targetLanguage}
            isAutoAudioEnabled={isAutoAudioEnabled}
            setIsAutoAudioEnabled={setIsAutoAudioEnabled}
          />
        </div>

        {renameModal.isOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-title"
          >
            <div className="w-full max-w-sm rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-2xl shadow-black/10">
              <h3 id="rename-title" className="mb-4 text-base font-semibold text-[rgb(var(--text))]">Rename chat</h3>
              <input
                autoFocus
                value={renameModal.draftTitle}
                onChange={(e) => setRenameModal({ ...renameModal, draftTitle: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                className="mb-5 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] px-3 py-2.5 text-sm text-[rgb(var(--text))] outline-none ring-0 transition placeholder:text-[rgb(var(--text-subtle))] focus:border-[rgb(var(--accent-light))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameModal({ isOpen: false, id: null, draftTitle: '' })}
                  className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-secondary))] transition hover:bg-[rgb(var(--surface-muted))]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveRename}
                  className="rounded-xl bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgb(var(--accent-light))]/20 transition hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      </SignedIn>
    </>
  );
}
