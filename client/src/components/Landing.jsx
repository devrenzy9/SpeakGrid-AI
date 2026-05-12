import { ArrowRight, Check, Mic, Sparkles, WandSparkles, Workflow } from 'lucide-react';

const QUICK_ACTIONS = [
  'Summarize today’s AI updates in 45 seconds.',
  'Translate this answer to Hindi and make it voice friendly.',
  'Turn this image into a short spoken description.',
];

function Step({ number, title, desc }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-4">
      <div className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[rgb(var(--accent))]/20 px-1.5 text-xs font-semibold text-[rgb(var(--accent-light))]">
        {number}
      </div>
      <p className="mt-3 text-sm font-medium text-[rgb(var(--text))]">{title}</p>
      <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">{desc}</p>
    </div>
  );
}

export default function Landing({ onStart, onQuickPrompt }) {
  return (
    <div className="pb-10 pt-2 sm:pt-4">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-5 shadow-md shadow-black/5 sm:p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-3 py-1 text-xs font-medium text-[rgb(var(--text-secondary))]">
            <Sparkles className="h-3.5 w-5 text-[rgb(var(--accent))]" aria-hidden />
            Voice workspace
          </div>

          <h1 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight text-[rgb(var(--text))] sm:text-3xl">
            Build spoken responses, translations, and attachments in one clean workspace.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[rgb(var(--text-secondary))] sm:text-base">
            Start from a quick action or type your own prompt. Your assistant response, translated speech output,
            and audio playback stay connected in a single flow.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-2.5 py-1 text-xs text-[rgb(var(--text-secondary))]">
              <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
              Multimodal chat
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-2.5 py-1 text-xs text-[rgb(var(--text-secondary))]">
              <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
              Translation-aware TTS
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-2.5 py-1 text-xs text-[rgb(var(--text-secondary))]">
              <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
              Session memory
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--accent))] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Start a prompt
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <p className="text-xs text-[rgb(var(--text-subtle))]">Tip: attach an image for richer voice summaries.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <WandSparkles className="h-4 w-4 text-[rgb(var(--accent))]" aria-hidden />
            <p className="text-sm font-medium text-[rgb(var(--text))]">Quick starters</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => onQuickPrompt(action)}
                className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] px-3 py-2 text-left text-sm text-[rgb(var(--text-secondary))] transition hover:border-[rgb(var(--accent-light))]/40 hover:text-[rgb(var(--text))]"
              >
                {action}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-5">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-[rgb(var(--accent))]" aria-hidden />
              <p className="text-sm font-medium text-[rgb(var(--text))]">How it works</p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Step number="1" title="Ask or attach" desc="Send text or image context into the same thread." />
              <Step number="2" title="Generate reply" desc="Get a concise answer optimized for voice output." />
              <Step number="3" title="Play translated audio" desc="Use your selected language for spoken playback." />
            </div>
          </div>

          <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-5">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-[rgb(var(--accent))]" aria-hidden />
              <p className="text-sm font-medium text-[rgb(var(--text))]">Sample output modes</p>
            </div>
            <div className="mt-3 space-y-2">
              <div className="rounded-xl border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-3 py-2 text-sm text-[rgb(var(--text-secondary))]">
                Brief answer + playable audio
              </div>
              <div className="rounded-xl border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-3 py-2 text-sm text-[rgb(var(--text-secondary))]">
                Multi-language spoken response
              </div>
              <div className="rounded-xl border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-muted))] px-3 py-2 text-sm text-[rgb(var(--text-secondary))]">
                Image-to-voice explanation
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
   );
}


