"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Selecione uma imagem primeiro!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImageUrl(data.url);
      } else {
        alert("Erro no upload: " + data.error);
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro na conexão.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-green-800 mb-6">
        🚀 Upload de Imagens - AgroHelp
      </h1>

      <form
        onSubmit={handleUpload}
        className="flex flex-col items-center gap-4"
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="border rounded p-2"
        />
        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          disabled={uploading}
        >
          {uploading ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {imageUrl && (
        <div className="mt-6 text-center">
          <p className="font-medium">Imagem enviada com sucesso:</p>
          <a
            href={imageUrl}
            target="_blank"
            className="text-blue-600 underline"
          >
            {imageUrl}
          </a>
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Imagem enviada"
              className="max-w-xs rounded shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
