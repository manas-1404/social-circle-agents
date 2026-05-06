import { auth } from "@/lib/auth";
import { getUserRooms } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateRoomButton } from "@/components/CreateRoomButton";

export default async function RoomsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const userRooms = await getUserRooms(session.user.id);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Your Chats</h1>
        <CreateRoomButton />
      </div>

      {userRooms.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-lg mb-2">No chats yet.</p>
          <p className="text-sm">Create one and add some shapes to get started.</p>
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

