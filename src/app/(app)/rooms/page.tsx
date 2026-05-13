import { auth } from "@/lib/auth";
import { getUserRooms } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateRoomButton } from "@/components/CreateRoomButton";
import { HowItWorks } from "@/components/HowItWorks";
import { UnreadDot } from "@/components/UnreadDot";
import { DeleteRoomButton } from "@/components/DeleteRoomButton";

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function RoomsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const userRooms = await getUserRooms(session.user.id);
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-full">
      {/* ── Greeting banner ── */}
      <div className="relative border-b border-zinc-800/60 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-0 left-1/3 w-64 h-32 bg-violet-700/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 py-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-500 font-medium mb-1">{getGreeting()}</p>
            <h1 className="text-2xl font-black tracking-tight text-zinc-100">{firstName}&apos;s chats</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {userRooms.length === 0
                ? "No rooms yet — create one to get started"
                : `${userRooms.length} room${userRooms.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <CreateRoomButton />
        </div>
      </div>

      {/* ── Room list ── */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <HowItWorks defaultOpen={userRooms.length === 0} />

        {userRooms.length === 0 ? (
          /* Empty state */
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-900/60 to-zinc-900 border border-violet-800/30 flex items-center justify-center mx-auto mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-violet-400" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-zinc-200 mb-2">No chats yet</h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-xs mx-auto">
              Create a room, add some shapes, and start a conversation.
            </p>
            <CreateRoomButton />
          </div>
        ) : (
          <div className="space-y-3">
            {userRooms.map(({ room, lastMessageAt }, idx) => {
              const lastAt = lastMessageAt ? new Date(lastMessageAt) : null;
              const timeAgo = lastAt ? formatTimeAgo(lastAt) : null;
              const isOwner = room.owner_id === session.user.id;
              const letter = room.name[0].toUpperCase();
              // Cycle through accent colors for variety
              const accents = [
                "from-violet-800/60 to-violet-900/40 border-violet-700/30 text-violet-200",
                "from-fuchsia-800/60 to-fuchsia-900/40 border-fuchsia-700/30 text-fuchsia-200",
                "from-blue-800/60 to-blue-900/40 border-blue-700/30 text-blue-200",
                "from-emerald-800/60 to-emerald-900/40 border-emerald-700/30 text-emerald-200",
              ];
              const accent = accents[idx % accents.length];

              return (
                <div key={room.id} className="flex items-center gap-2 group/row">
                  <Link
                    href={`/rooms/${room.id}`}
                    className="flex-1 flex items-center gap-4 px-5 py-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/60 hover:border-zinc-700/60 transition-all group"
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent} border flex items-center justify-center text-lg font-black flex-shrink-0`}>
                      {letter}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <span className="font-semibold text-zinc-100 truncate">{room.name}</span>
                        <UnreadDot roomId={room.id} lastMessageAt={lastMessageAt ? String(lastMessageAt) : null} />
                        {isOwner && (
                          <span className="text-[10px] text-zinc-600 border border-zinc-800 rounded-full px-1.5 py-px flex-shrink-0">owner</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {timeAgo ? `Active ${timeAgo}` : <span className="capitalize">{room.mode} mode</span>}
                      </p>
                    </div>

                    {/* Right chevron */}
                    <svg className="text-zinc-700 group-hover:text-zinc-500 flex-shrink-0 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                  {isOwner && <DeleteRoomButton roomId={room.id} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
