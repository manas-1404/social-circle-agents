import { auth } from "@/lib/auth";
import { getUserRooms } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateRoomButton } from "@/components/CreateRoomButton";
import { HowItWorks } from "@/components/HowItWorks";

export default async function RoomsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const userRooms = await getUserRooms(session.user.id);

  return (
    <div className="max-w-xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Chats</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{userRooms.length} room{userRooms.length !== 1 ? "s" : ""}</p>
        </div>
        <CreateRoomButton />
      </div>

      <HowItWorks />

      {userRooms.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-800 p-10 text-center">
          <p className="text-2xl mb-2 text-violet-400">✦</p>
          <p className="text-sm font-medium text-zinc-300 mb-1">No chats yet</p>
          <p className="text-xs text-zinc-600">Hit "New Chat" above, then add some shapes to get started.</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {userRooms.map(({ room }) => (
            <li key={room.id}>
              <Link
                href={`/rooms/${room.id}`}
                className="group flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors flex items-center justify-center text-sm font-bold text-zinc-400">
                    {room.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100">{room.name}</p>
                    <p className="text-xs text-zinc-600 capitalize">{room.mode}</p>
                  </div>
                </div>
                <svg className="text-zinc-700 group-hover:text-zinc-500 transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

