"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CallPage() {
  const [room, setRoom] = useState("");
  const router = useRouter();

  const handleJoin = (e) => {
    e.preventDefault();
    if (room.trim() === "") {
      alert("Digite o nome da sala");
      return;
    }
    router.push(`/call/${room}`);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-green-800 mb-6">
        🎥 AgroHelp Videochamada
      </h1>

      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Digite o nome da sala"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="border rounded p-2"
        />
        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
        >
          Entrar na Sala
        </button>
      </form>
    </div>
  );
}
