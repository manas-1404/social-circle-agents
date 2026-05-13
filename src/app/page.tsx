import Link from "next/link";

const demoMessages = [
  { id: 1, type: "human", name: "you", content: "Morning! Anyone have plans for the weekend?" },
  { id: 2, type: "shape", name: "Luna", color: "violet", content: "Didn't you mention wanting to try hiking last week? ✨" },
  { id: 3, type: "shape", name: "Rex", color: "blue", content: "Weekend plans are overrated. Just go where the day takes you." },
  { id: 4, type: "human", name: "you", content: "Luna you remembered!! Yes I was thinking about that trail" },
  { id: 5, type: "shape", name: "Muse", color: "fuchsia", content: "The one near the lake? Go at 7am — the light there is insane 📸" },
  { id: 6, type: "shape", name: "Luna", color: "violet", content: "You always feel better after time outside. Go 🌿" },
];

const steps = [
  {
    num: "01",
    title: "Build a Shape",
    desc: "Name them, write a backstory, set how they speak. They're yours.",
    color: "violet",
  },
  {
    num: "02",
    title: "Chat Together",
    desc: "Drop into a room. Shapes read the conversation and jump in when they have something to say.",
    color: "fuchsia",
  },
  {
    num: "03",
    title: "Grow Together",
    desc: "The more you talk, the more they feel like someone who actually knows you.",
    color: "pink",
  },
];

const marqueeItems = [
  "Unique personalities", "Long-term memory", "Real-time chat", "Group dynamics",
  "Custom shapes", "Invite friends", "Free will AI", "Always learning",
  "Unique personalities", "Long-term memory", "Real-time chat", "Group dynamics",
  "Custom shapes", "Invite friends", "Free will AI", "Always learning",
];

export default function LandingPage() {
  return (
    <div className="bg-zinc-950 text-zinc-100 overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 backdrop-blur-xl bg-zinc-950/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
            <span className="text-white text-xs font-black">S</span>
          </div>
          <span className="font-bold text-zinc-100 tracking-tight">Social Agents</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-700/10 blur-[120px] animate-glow-pulse pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-fuchsia-700/8 blur-[80px] pointer-events-none" />

        <div className="relative mb-6 flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-800/60 bg-violet-950/40 text-xs text-violet-300 font-medium animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block animate-pulse" />
          AI companions with actual free will
        </div>

        <h1 className="relative text-center font-black tracking-tighter leading-[0.95] mb-6 animate-fade-up" style={{ animationDelay: "0.1s", fontSize: "clamp(3rem, 8vw, 6.5rem)" }}>
          Meet your{" "}
          <span className="gradient-text">shapes.</span>
          <br />
          <span className="text-zinc-200">They have something to say.</span>
        </h1>

        <p className="relative text-center text-zinc-400 max-w-lg mb-10 leading-relaxed animate-fade-up text-base md:text-lg" style={{ animationDelay: "0.2s" }}>
          Create AI agents with unique personalities and memory. Chat with them like people.
          Invite friends to join.
        </p>

        <div className="relative flex flex-wrap items-center justify-center gap-3 mb-20 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/sign-up"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-violet-900/40 active:scale-100"
          >
            Create your first shape
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/sign-in"
            className="text-zinc-400 hover:text-zinc-100 font-medium px-6 py-3 rounded-xl text-sm border border-zinc-800 hover:border-zinc-700 transition-all hover:bg-zinc-900"
          >
            Sign in
          </Link>
        </div>

        {/* Floating cards + chat preview */}
        <div className="relative w-full max-w-4xl mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <div className="absolute -left-4 top-8 z-10 animate-float hidden md:block">
            <ShapeCard name="Luna" traits={["curious", "poetic"]} color="violet" />
          </div>
          <div className="absolute -left-8 bottom-16 z-10 animate-float-slow hidden md:block">
            <ShapeCard name="Rex" traits={["bold", "direct"]} color="blue" />
          </div>
          <div className="absolute -right-4 top-4 z-10 animate-float-delayed hidden md:block">
            <ShapeCard name="Muse" traits={["creative", "warm"]} color="fuchsia" />
          </div>
          <div className="absolute -right-6 bottom-20 z-10 animate-float hidden md:block" style={{ animationDelay: "1.2s" }}>
            <ShapeCard name="Echo" traits={["witty", "calm"]} color="emerald" />
          </div>

          {/* Chat preview */}
          <div className="mx-auto max-w-lg glass-card rounded-2xl overflow-hidden glow-violet shadow-2xl shadow-black/60">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60 bg-zinc-900/60">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">W</span>
                </div>
                <span className="text-xs text-zinc-400 font-medium">Weekend vibes 🌄</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-zinc-600">3 shapes</span>
              </div>
            </div>

            <div className="px-4 py-4 space-y-3 bg-zinc-950/80">
              {demoMessages.map((msg) =>
                msg.type === "human" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="bg-violet-700/80 text-white text-xs px-3 py-2 rounded-2xl rounded-tr-sm max-w-[75%] leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex items-start gap-2">
                    <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white ${
                      msg.color === "violet" ? "bg-violet-600" :
                      msg.color === "fuchsia" ? "bg-fuchsia-600" :
                      msg.color === "blue" ? "bg-blue-600" : "bg-emerald-600"
                    }`}>
                      {msg.name[0]}
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 mb-0.5 font-medium">{msg.name}</p>
                      <div className="bg-zinc-800/80 text-zinc-200 text-xs px-3 py-2 rounded-2xl rounded-tl-sm max-w-[75%] leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              )}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-fuchsia-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">M</div>
                <div className="bg-zinc-800/80 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" style={{ animation: "bounce-dot 1.4s ease-in-out infinite" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" style={{ animation: "bounce-dot 1.4s ease-in-out infinite 0.15s" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" style={{ animation: "bounce-dot 1.4s ease-in-out infinite 0.3s" }} />
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-zinc-800/60 bg-zinc-900/50">
              <div className="flex items-center gap-2 bg-zinc-800/60 rounded-xl px-3 py-2">
                <span className="text-xs text-zinc-600 flex-1">Message the room…</span>
                <div className="w-6 h-6 rounded-lg bg-violet-600/40 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="text-violet-300" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="relative border-y border-zinc-800/60 bg-zinc-900/30 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {marqueeItems.map((item, i) => (
            <span key={i} className="flex items-center gap-3 mx-6 text-sm text-zinc-500 font-medium flex-shrink-0">
              <span className="w-1 h-1 rounded-full bg-violet-600 inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="relative px-6 py-28 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Up and running in minutes
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative glass-card rounded-2xl p-8 overflow-hidden hover:border-zinc-600/50 transition-all duration-300">
              <div className={`absolute top-0 right-0 text-[120px] font-black leading-none select-none pointer-events-none opacity-[0.04] ${
                step.color === "violet" ? "text-violet-400" :
                step.color === "fuchsia" ? "text-fuchsia-400" : "text-pink-400"
              }`}>
                {step.num}
              </div>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold mb-5 ${
                step.color === "violet" ? "bg-violet-500/15 text-violet-400 border border-violet-500/20" :
                step.color === "fuchsia" ? "bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/20" :
                "bg-pink-500/15 text-pink-400 border border-pink-500/20"
              }`}>
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">{step.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENTO GRID ── */}
      <section className="relative px-6 pb-28 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Personality builder — wide */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-8 overflow-hidden relative hover:border-zinc-700/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-72 h-72 bg-violet-700/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">Shape builder</p>
              <h3 className="text-2xl font-bold text-zinc-100 mb-6">Design their entire personality</h3>

              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-5 space-y-4">
                <div>
                  <p className="text-xs text-zinc-600 mb-2 font-medium">Display name</p>
                  <div className="bg-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300">Luna ✨</div>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-2 font-medium">Personality</p>
                  <div className="bg-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-400 leading-relaxed">
                    "Luna is thoughtful and poetic. She notices things others miss and genuinely cares about the people she talks to..."
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-2 font-medium">Traits</p>
                  <div className="flex flex-wrap gap-2">
                    {["Reflective", "Warm", "Metaphor-heavy", "Asks good questions"].map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-violet-900/40 border border-violet-700/30 text-violet-300 text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-2 font-medium">Eagerness to respond</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full w-3/5 bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full" />
                    </div>
                    <span className="text-sm text-zinc-500">Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Memory card */}
          <div className="glass-card rounded-2xl p-8 overflow-hidden relative hover:border-zinc-700/60 transition-all duration-300">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-fuchsia-700/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-semibold text-fuchsia-400 uppercase tracking-wider mb-3">Memory</p>
              <h3 className="text-xl font-bold text-zinc-100 mb-6">Remembers everything about you</h3>

              <div className="rounded-xl border border-fuchsia-900/30 bg-fuchsia-950/20 p-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-fuchsia-600 font-semibold">Luna's memory of you</p>
                {[
                  "Loves hiking near water",
                  "Learning piano (started last week)",
                  "Morning person",
                  "Works in tech, finds it draining",
                  "Has a dog named Biscuit 🐶",
                ].map((mem, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1 h-1 rounded-full bg-fuchsia-500 mt-2 flex-shrink-0" />
                    <p className="text-sm text-zinc-400">{mem}</p>
                  </div>
                ))}
                <div className="pt-2 border-t border-fuchsia-900/30 text-xs text-fuchsia-700">Updated moments ago</div>
              </div>
            </div>
          </div>

          {/* Free will card */}
          <div className="glass-card rounded-2xl p-8 overflow-hidden relative hover:border-zinc-700/60 transition-all duration-300">
            <div className="absolute top-0 left-0 w-48 h-48 bg-blue-700/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">Free will</p>
              <h3 className="text-xl font-bold text-zinc-100 mb-6">They decide when to talk</h3>

              <div className="space-y-3">
                {[
                  { name: "Rex", action: "passed on this one", color: "blue", muted: true },
                  { name: "Luna", action: "is replying…", color: "violet", muted: false },
                  { name: "Muse", action: "will respond in a moment", color: "fuchsia", muted: false },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 ${item.muted ? "opacity-35" : ""}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      item.color === "violet" ? "bg-violet-400" :
                      item.color === "fuchsia" ? "bg-fuchsia-400" : "bg-blue-400"
                    } ${!item.muted ? "animate-pulse" : ""}`} />
                    <span className="text-sm text-zinc-400">
                      <span className="text-zinc-200 font-medium">{item.name}</span> {item.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invite card — wide */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-8 overflow-hidden relative hover:border-zinc-700/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Multiplayer</p>
              <h3 className="text-2xl font-bold text-zinc-100 mb-6">Bring your actual friends</h3>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-4">
                  <p className="text-xs text-zinc-600 font-medium mb-3">Invite link</p>
                  <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2.5">
                    <span className="text-sm text-zinc-500 flex-1 truncate">socialagents.app/join/xk7p-r3m9</span>
                    <span className="flex-shrink-0 text-emerald-400 font-semibold text-xs flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </span>
                  </div>
                </div>

                <div className="flex-1 rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-4">
                  <p className="text-xs text-zinc-600 font-medium mb-3">In this room</p>
                  <div className="space-y-2.5">
                    {[
                      { name: "Alex (you)", type: "human", color: "zinc" },
                      { name: "Jordan", type: "human", color: "zinc" },
                      { name: "Luna", type: "shape", color: "violet" },
                      { name: "Rex", type: "shape", color: "blue" },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-white ${
                          m.color === "violet" ? "bg-violet-600" :
                          m.color === "blue" ? "bg-blue-600" : "bg-zinc-700"
                        }`}>
                          {m.name[0]}
                        </div>
                        <span className="text-sm text-zinc-400">{m.name}</span>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                          m.type === "shape"
                            ? "bg-violet-900/40 text-violet-400 border border-violet-800/30"
                            : "bg-zinc-800 text-zinc-600"
                        }`}>
                          {m.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── QUOTE BREAK ── */}
      <section className="relative border-y border-zinc-800/40 bg-zinc-900/20 py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-violet-700/8 blur-[80px]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            "Not another chatbot.<br />
            <span className="gradient-text">A room full of characters</span><br />
            who actually know you."
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative px-6 py-32 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-700/10 blur-[100px] animate-glow-pulse pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center glass-card rounded-3xl p-12 md:p-16 glow-violet">
          <div className="flex items-center justify-center gap-2 mb-8">
            {[
              { letter: "L", color: "bg-violet-600" },
              { letter: "R", color: "bg-blue-600" },
              { letter: "M", color: "bg-fuchsia-600" },
              { letter: "E", color: "bg-emerald-600" },
            ].map((s, i) => (
              <div
                key={i}
                className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center text-sm font-bold text-white shadow-lg`}
                style={{ transform: `rotate(${(i - 1.5) * 5}deg)` }}
              >
                {s.letter}
              </div>
            ))}
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Ready to meet your<br />
            <span className="gradient-text">first shape?</span>
          </h2>
          <p className="text-zinc-500 mb-10 text-base leading-relaxed">
            Free to start. No credit card needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all hover:scale-105 hover:shadow-xl hover:shadow-violet-900/50 active:scale-100 w-full sm:w-auto justify-center"
            >
              Create your first shape
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/sign-in" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors font-medium">
              Already have an account →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-800/40 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-black">S</span>
            </div>
            <span className="text-sm font-semibold text-zinc-500">Social Agents</span>
          </div>
          <p className="text-sm text-zinc-700">AI companions that actually have something to say.</p>
        </div>
      </footer>

    </div>
  );
}

function ShapeCard({
  name,
  traits,
  color,
}: {
  name: string;
  traits: string[];
  color: "violet" | "blue" | "fuchsia" | "emerald";
}) {
  const colorMap = {
    violet: { bg: "bg-violet-600", border: "border-violet-800/40", badge: "bg-violet-900/60 text-violet-300 border-violet-700/30" },
    blue: { bg: "bg-blue-600", border: "border-blue-800/40", badge: "bg-blue-900/60 text-blue-300 border-blue-700/30" },
    fuchsia: { bg: "bg-fuchsia-600", border: "border-fuchsia-800/40", badge: "bg-fuchsia-900/60 text-fuchsia-300 border-fuchsia-700/30" },
    emerald: { bg: "bg-emerald-600", border: "border-emerald-800/40", badge: "bg-emerald-900/60 text-emerald-300 border-emerald-700/30" },
  };
  const c = colorMap[color];

  return (
    <div className={`glass-card rounded-xl px-3 py-2.5 flex items-center gap-2.5 shadow-xl shadow-black/40 ${c.border}`}>
      <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
        {name[0]}
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-200">{name}</p>
        <div className="flex gap-1 mt-0.5">
          {traits.map((t) => (
            <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded-full border ${c.badge}`}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
