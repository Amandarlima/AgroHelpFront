"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

<button
  onClick={async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }}
  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
>
  Sair
</button>


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Erro ao buscar chamadas:", error);
    } else {
      setCalls(data);
    }
    setLoading(false);
  };

  const deleteCall = async (id) => {
    const { error } = await supabase.from("calls").delete().eq("id", id);
    if (error) {
      console.error("Erro ao deletar:", error);
    } else {
      fetchCalls();
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-green-800">
        📜 Histórico de Chamadas
      </h1>

      {loading ? (
        <p>🔄 Carregando...</p>
      ) : calls.length === 0 ? (
        <p>❌ Nenhuma chamada encontrada.</p>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-green-100">
              <th className="p-2">Sala</th>
              <th className="p-2">Data/Hora</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-t">
                <td className="p-2">{call.room}</td>
                <td className="p-2">
                  {new Date(call.timestamp).toLocaleString("pt-BR")}
                </td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => router.push(`/call/${call.room}`)}
                    className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    🔗 Entrar
                  </button>
                  <button
                    onClick={() => deleteCall(call.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    🗑️ Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
