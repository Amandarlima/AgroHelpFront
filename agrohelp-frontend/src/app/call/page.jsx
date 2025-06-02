// src/app/call/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CallPage() {
  const [roomInput, setRoomInput] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleJoin = () => {
    if (!roomInput.trim()) return;
    router.push(`/call/${roomInput}`);
  };

  const handleCreate = () => {
    const newRoom = Math.random().toString(36).substring(2, 10);
    router.push(`/call/${newRoom}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-green-800 mb-6">Fale com um especialista!</h1>

        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Entrar em uma sala:</label>
            <input
              type="text"
              placeholder="Digite o nome da sala"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              className="w-full border px-3 py-2 rounded shadow-sm"
            />
          </div>

          <button
            onClick={handleJoin}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
          >
            Entrar na sala
          </button>

          <div className="text-center text-gray-600">ou</div>

          <button
            onClick={handleCreate}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4"
          >
            Criar nova sala
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
