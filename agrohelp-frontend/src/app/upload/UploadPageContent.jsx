"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import Image from "next/image";

export default function UploadPageContent() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = getSupabaseClient();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setMessage("");

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error("Usuário não autenticado.");
      }

      const userId = session.user.id;

      const { error: uploadError } = await supabase.storage
        .from("agroimagens")
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("agroimagens")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData?.publicUrl;

      const { error: insertError } = await supabase.from("uploads").insert([
        {
          user_id: userId,
          file_name: fileName,
          url: publicUrl,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      setMessage("Imagem enviada e registrada com sucesso! 🎉");
      setSelectedFile(null);
      setPreviewUrl("");
    } catch (error) {
      setMessage("Erro ao enviar imagem: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-green-800 text-center">Upload de Imagem</h1>

        <div className="flex flex-col items-center justify-center space-y-4">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Preview"
              width={300}
              height={300}
              className="rounded-lg shadow-md object-cover"
            />
          ) : (
            <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Nenhuma imagem selecionada
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-green-600 file:text-white
              hover:file:bg-green-700"
          />

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full py-2 rounded-md bg-green-700 text-white font-semibold hover:bg-green-800 transition"
          >
            {uploading ? "Enviando..." : "Enviar Imagem"}
          </button>

          {message && (
            <p className="text-sm text-center text-green-700 font-medium">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
