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
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Chats</h1>
        <CreateRoomButton />
      </div>

      <HowItWorks />

      {userRooms.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-4xl mb-3">✦</p>
          <p className="text-base font-medium mb-1">No chats yet</p>
          <p className="text-sm">Create a room above, then add shapes from the sidebar to start chatting.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {userRooms.map(({ room }) => (
            <li key={room.id}>
              <Link
                href={`/rooms/${room.id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div>
                  <p className="font-medium">{room.name}</p>
                  <p className="text-xs text-zinc-500 capitalize">{room.mode} mode</p>
                </div>
                <span className="text-zinc-400">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

