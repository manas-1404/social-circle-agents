"use client";

import { useState } from "react";

export function InviteButton({ inviteCode }: { inviteCode: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const fullUrl = `${window.location.origin}/join/${inviteCode}`;
    await navigator.clipboard.writeText(fullUrl);
    setUrl(fullUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setUrl(null);
    }, 4000);
  }

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
      >
        {copied ? (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy invite link
          </>
        )}
      </button>

      {url && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 shadow-xl shadow-black/40">
          <p className="text-xs text-zinc-500 mb-1">Invite link</p>
          <code className="text-xs text-zinc-300 break-all leading-relaxed">{url}</code>
        </div>
      )}
    </div>
  );
}
