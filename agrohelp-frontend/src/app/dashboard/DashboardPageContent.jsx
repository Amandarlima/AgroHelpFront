"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import Image from "next/image";

export default function DashboardPageContent() {
  const supabase = getSupabaseClient();
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    async function loadData() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;
      setUser(user);

      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setUploads(data);
        setFiltered(data);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = uploads.filter(
      (item) =>
        item.file_name.toLowerCase().includes(query) ||
        new Date(item.created_at).toLocaleDateString("pt-BR").includes(query)
    );
    setFiltered(filtered);
    setCurrentPage(1);
  }, [search, uploads]);

  const handleDelete = async (upload) => {
    if (!confirm(`Excluir ${upload.file_name}?`)) return;

    await supabase.storage.from("agroimagens").remove([upload.file_name]);

    await supabase.from("uploads").delete().eq("id", upload.id);

    setUploads((prev) => prev.filter((item) => item.id !== upload.id));
  };

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6 text-center">Galeria</h1>

      <input
        type="text"
        placeholder="Buscar por nome ou data..."
        className="block mx-auto mb-6 p-2 w-full max-w-md border rounded shadow"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {paginated.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma imagem encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((upload) => (
            <div key={upload.id} className="bg-white shadow-md rounded p-4">
              <Image
                src={upload.url}
                alt={upload.file_name}
                width={400}
                height={300}
                className="w-full h-48 object-cover rounded cursor-pointer"
                onClick={() => setSelectedImage(upload.url)}
              />
              <div className="mt-2">
                <p className="font-semibold">{upload.file_name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(upload.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <button
                onClick={() => handleDelete(upload)}
                className="mt-3 text-red-600 text-sm hover:underline"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8 gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 bg-green-700 text-white rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          disabled={currentPage * itemsPerPage >= filtered.length}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 bg-green-700 text-white rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <Image
            src={selectedImage}
            alt="Preview"
            width={900}
            height={600}
            className="rounded max-h-[90vh] max-w-[90vw]"
          />
        </div>
      )}
    </div>
  );
}
