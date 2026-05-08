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

export default async function RoomsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const userRooms = await getUserRooms(session.user.id);

  return (
    <div className="max-w-xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Chats</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{userRooms.length} room{userRooms.length !== 1 ? "s" : ""}</p>
        </div>
        <CreateRoomButton />
      </div>

      <HowItWorks />

      {userRooms.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-700 p-10 text-center">
          <p className="text-3xl mb-3 text-violet-400">✦</p>
          <p className="text-base font-semibold text-zinc-200 mb-1">No chats yet</p>
          <p className="text-sm text-zinc-500">Hit "New Chat" above, then add some shapes to get started.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {userRooms.map(({ room, lastMessageAt }) => {
            const lastAt = lastMessageAt ? new Date(lastMessageAt) : null;
            const timeAgo = lastAt ? formatTimeAgo(lastAt) : null;
            const isOwner = room.owner_id === session.user.id;
            return (
              <li key={room.id} className="flex items-center gap-1 group/row">
                <Link
                  href={`/rooms/${room.id}`}
                  className="flex-1 group flex items-center justify-between px-4 py-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800 hover:border-zinc-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors flex items-center justify-center text-base font-bold text-zinc-300 flex-shrink-0">
                      {room.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-zinc-100">{room.name}</p>
                        <UnreadDot roomId={room.id} lastMessageAt={lastMessageAt ? String(lastMessageAt) : null} />
                      </div>
                      <p className="text-sm text-zinc-500">
                        {timeAgo ? `active ${timeAgo}` : <span className="capitalize">{room.mode} mode</span>}
                      </p>
                    </div>
                  </div>
                  <svg className="text-zinc-600 group-hover:text-zinc-400 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
                {isOwner && <DeleteRoomButton roomId={room.id} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

