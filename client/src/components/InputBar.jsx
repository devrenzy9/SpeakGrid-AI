import { Paperclip, Send, X } from 'lucide-react';

const LANGUAGE_OPTIONS = ['Auto', 'English', 'Hindi', 'Spanish', 'French', 'German', 'Arabic', 'Tamil', 'Japanese', 'Korean'];
const OUTPUT_MODE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'concise', label: 'Concise' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'support-agent', label: 'Support Agent' },
];

export default function InputBar({
  input, setInput, file, setFile, outputMode, setOutputMode, targetLanguage, setTargetLanguage, previewUrl, isLoading, sendMessage
}) {
  const canSend = !isLoading && (input.trim() || file);

  return (
    <div className="shrink-0 border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-3 backdrop-blur-lg sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        {previewUrl && (
          <div className="group relative mb-3 inline-block">
            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] p-2 shadow-sm shadow-black/5">
              <img src={previewUrl} alt="Preview" className="block h-24 max-w-full rounded-xl object-cover ring-1 ring-[rgb(var(--border-soft))]" />
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg opacity-0 shadow-black/20 transition group-hover:opacity-100 hover:brightness-110"
              aria-label="Remove attachment"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={sendMessage}
          className="flex items-end gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] p-2 shadow-sm shadow-black/5 backdrop-blur-sm transition focus-within:border-[rgb(var(--accent-light))] focus-within:ring-2 focus-within:ring-[rgb(var(--accent))]/20 sm:gap-3 sm:p-2.5"
        >
          <label
            className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-transparent text-[rgb(var(--text-subtle))] transition hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--text-secondary))] ${isLoading ? 'pointer-events-none opacity-40' : ''}`}
          >
            <Paperclip className="h-5 w-5" aria-hidden />
            <input type="file" onChange={(e) => setFile(e.target.files[0])} disabled={isLoading} className="hidden" key={file ? file.name : 'empty'} />
          </label>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message SpeakGrid AI…"
            disabled={isLoading}
            className="min-h-[44px] flex-1 border-0 bg-transparent py-2.5 text-sm text-[rgb(var(--text))] outline-none ring-0 placeholder:text-[rgb(var(--text-subtle))] sm:text-[15px]"
          />

          <select
            value={outputMode}
            onChange={(e) => setOutputMode(e.target.value)}
            disabled={isLoading}
            className="h-11 max-w-[116px] rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-2 text-xs font-medium text-[rgb(var(--text-secondary))] outline-none transition focus:border-[rgb(var(--accent-light))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-[138px] sm:px-3 sm:text-sm"
            aria-label="Speak as mode"
          >
            {OUTPUT_MODE_OPTIONS.map((mode) => (
              <option key={mode.value} value={mode.value} className="bg-[rgb(var(--surface))] text-[rgb(var(--text))]">
                {mode.label}
              </option>
            ))}
          </select>

          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            disabled={isLoading}
            className="h-11 max-w-[108px] rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-2 text-xs font-medium text-[rgb(var(--text-secondary))] outline-none transition focus:border-[rgb(var(--accent-light))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-[132px] sm:px-3 sm:text-sm"
            aria-label="Target speech language"
          >
            {LANGUAGE_OPTIONS.map((language) => (
              <option key={language} value={language} className="bg-[rgb(var(--surface))] text-[rgb(var(--text))]">
                {language}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!canSend}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition sm:h-11 sm:w-auto sm:px-5 ${canSend
              ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent-light))]/20 hover:opacity-90'
              : 'cursor-not-allowed bg-[rgb(var(--surface-muted))] text-[rgb(var(--text-subtle))]'
              }`}
            aria-label="Send message"
          >
            <Send className="h-[18px] w-[18px] sm:hidden" />
            <span className="hidden text-sm font-semibold sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
