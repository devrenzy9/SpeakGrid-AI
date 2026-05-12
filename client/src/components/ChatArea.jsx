import { Copy, Check, Pencil, Play, Pause, Paperclip, Languages, Waves } from 'lucide-react';
import Landing from './Landing';

function audioKey(msg) {
  return msg.audioFileName || msg.audioUrl?.split('/').pop();
}

export default function ChatArea({
  activeSession, isLoading, togglePlayMessage, playingAudioId, isAudioPlaying,
  messagesEndRef, handleCopy, copiedId,
  editingMessageIndex, setEditingMessageIndex, editDraft, setEditDraft, handleResubmitEdit,
  onQuickPrompt
}) {

  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split('\n').map((line, lineIndex) => {
      const parts = line.split(urlRegex);
      return (
        <span key={lineIndex}>
          {parts.map((part, partIndex) => {
            if (part.match(urlRegex)) {
              return (
                <a
                  key={partIndex}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-amber-300 underline decoration-amber-300/40 underline-offset-2 transition hover:text-amber-200"
                >
                  {part}
                </a>
              );
            }
            return part;
          })}
          <br />
        </span>
      );
    });
  };

  return (
    <div className="chat-scroll flex flex-1 flex-col items-center overflow-y-auto px-4 py-4 sm:px-6">
      <div className="w-full max-w-3xl">
        {(!activeSession || activeSession.messages.length === 0) && (
          <Landing onStart={() => { /* input is already focused-ready below */ }} onQuickPrompt={onQuickPrompt} />
        )}

        {activeSession?.messages.map((msg, index) => {
          const key = audioKey(msg);
          const isPlayingThis = key && playingAudioId === key && isAudioPlaying;

          return (
            <div
              key={index}
              className="message-in mb-8 flex flex-col"
              style={{ animationDelay: `${Math.min(index, 12) * 0.04}s` }}
            >
              <div
                className={`max-w-[min(100%,40rem)] text-[15px] leading-relaxed tracking-tight sm:text-base ${msg.role === 'user'
                  ? 'ml-auto rounded-xl border border-[rgb(var(--accent-light))]/30 bg-[rgb(var(--accent-subtle))] px-4 py-3 text-[rgb(var(--text))] shadow-sm shadow-black/5'
                  : 'mr-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-3 text-[rgb(var(--text))] shadow-sm shadow-black/5 backdrop-blur-sm'
                  }`}
              >

                {editingMessageIndex === index ? (
                  <div className="min-w-[min(100%,20rem)] w-full">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      className="min-h-[120px] w-full resize-y rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] px-3 py-2.5 text-sm text-[rgb(var(--text))] outline-none ring-0 transition focus:border-[rgb(var(--accent-light))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20"
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingMessageIndex(null)}
                        className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-2 text-sm font-medium text-[rgb(var(--text-secondary))] transition hover:bg-[rgb(var(--surface-muted))]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResubmitEdit(index, editDraft)}
                        className="rounded-xl bg-[rgb(var(--accent))] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[rgb(var(--accent-light))]/20 transition hover:opacity-90"
                      >
                        Save &amp; submit
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {msg.previewUrl && (
                      <img
                        src={msg.previewUrl}
                        alt="attachment"
                        className="mb-3 max-h-64 w-full max-w-md rounded-xl border border-[rgb(var(--border))] object-cover"
                      />
                    )}
                    {msg.fileName && !msg.previewUrl && (
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-2.5 py-1 text-xs text-[rgb(var(--text-secondary))]">
                        <Paperclip className="h-3.5 w-3.5 text-[rgb(var(--text-subtle))]" aria-hidden />
                        {msg.fileName}
                      </div>
                    )}

                    <div className="whitespace-pre-wrap break-words">{renderTextWithLinks(msg.text)}</div>

                    {msg.role === 'assistant' && (msg.audioFileName || msg.audioUrl) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-2 py-1 text-[11px] text-[rgb(var(--text-subtle))]">
                          <Languages className="h-3 w-3" aria-hidden />
                          {msg.targetLanguage || 'Auto'}
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-2 py-1 text-[11px] text-[rgb(var(--text-subtle))]">
                          <Waves className="h-3 w-3" aria-hidden />
                          Audio ready
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePlayMessage(audioKey(msg))}
                          className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-3 py-1.5 text-sm font-medium text-[rgb(var(--text-secondary))] transition hover:border-[rgb(var(--accent-light))]/40 hover:bg-[rgb(var(--surface-muted))]"
                        >
                          {isPlayingThis ? (
                            <>
                              <Pause className="h-4 w-4" aria-hidden />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" aria-hidden />
                              {playingAudioId === key ? 'Resume' : 'Play'}
                            </>
                          )}
                        </button>

                        {isPlayingThis && (
                          <div className="flex h-4 items-end gap-1 pl-1" aria-hidden>
                            <span className="viz-bar" style={{ animationDelay: '0ms' }} />
                            <span className="viz-bar" style={{ animationDelay: '120ms' }} />
                            <span className="viz-bar" style={{ animationDelay: '240ms' }} />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

                {editingMessageIndex !== index && (
                  <div
                    className={`mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-[rgb(var(--text-subtle))] ${msg.role === 'user' ? 'justify-end pr-1' : 'justify-start pl-1'
                      }`}
                  >
                    {msg.role === 'user' && (
                      <button
                        type="button"
                        onClick={() => { setEditingMessageIndex(index); setEditDraft(msg.text); }}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[rgb(var(--text-secondary))] transition hover:bg-[rgb(var(--surface-muted))] hover:text-[rgb(var(--text))]"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text, index)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[rgb(var(--text-secondary))] transition hover:bg-[rgb(var(--surface-muted))] hover:text-[rgb(var(--text))]"
                    >
                      {copiedId === index ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
            </div>
          );
        })}

        {isLoading && (
          <div className="message-in flex items-center gap-3 py-2 text-sm text-[rgb(var(--text-subtle))]">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--accent))]/90 [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--accent-light))]/90 [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--text-subtle))]" />
            </span>
            <span>Thinking…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
