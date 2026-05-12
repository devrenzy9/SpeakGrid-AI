import { Globe, Languages, Radio, Volume2, VolumeX, Waves } from 'lucide-react';

const VOICE_PRESETS = [
  { name: 'Studio Narrator', tone: 'Balanced' },
  { name: 'Warm Guide', tone: 'Conversational' },
  { name: 'Brief Analyst', tone: 'Concise' },
];

export default function WorkspacePanel({
  targetLanguage,
  isAutoAudioEnabled,
  setIsAutoAudioEnabled,
}) {
  return (
    <aside className="hidden w-[300px] shrink-0 border-l border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] px-4 py-4 backdrop-blur-sm xl:flex xl:flex-col xl:gap-4">
      <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-subtle))]">Voice controls</p>
            <p className="mt-1 text-sm font-medium text-[rgb(var(--text))]">Playback mode</p>
          </div>
          <Waves className="h-5 w-5 text-[rgb(var(--accent))]" aria-hidden />
        </div>
        <button
          type="button"
          onClick={() => setIsAutoAudioEnabled(!isAutoAudioEnabled)}
          className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
            isAutoAudioEnabled
              ? 'border-[rgb(var(--accent-light))]/40 bg-[rgb(var(--accent))]/15 text-[rgb(var(--accent-light))]'
              : 'border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface))]'
          }`}
        >
          {isAutoAudioEnabled ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
          {isAutoAudioEnabled ? 'Auto play enabled' : 'Auto play disabled'}
        </button>
      </section>

      <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-[rgb(var(--accent))]" aria-hidden />
          <p className="text-sm font-medium text-[rgb(var(--text))]">Speech language</p>
        </div>
        <p className="mt-2 text-xs text-[rgb(var(--text-subtle))]">
          Current output language:
        </p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-3 py-1.5 text-sm text-[rgb(var(--text-secondary))]">
          <Globe className="h-3.5 w-3.5 text-[rgb(var(--text-subtle))]" aria-hidden />
          {targetLanguage}
        </div>
      </section>

      <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-[rgb(var(--accent))]" aria-hidden />
          <p className="text-sm font-medium text-[rgb(var(--text))]">Voice preview cards</p>
        </div>
        <div className="mt-3 space-y-2">
          {VOICE_PRESETS.map((voice) => (
            <div key={voice.name} className="rounded-xl border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-3 py-2">
              <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">{voice.name}</p>
              <p className="text-xs text-[rgb(var(--text-subtle))]">{voice.tone}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

