"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabaseClient";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
    } else {
      alert("Cadastro realizado! Verifique seu e-mail para confirmar.");
      router.push("/login");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center">
          <Image
            src="/logo-agrohelp.png"
            alt="AgroHelp Logo"
            width={80}
            height={80}
          />
          <h1 className="text-2xl font-bold text-green-800 mt-2">Criar conta</h1>
          <p className="text-sm text-gray-600">Preencha seus dados abaixo</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <input
            type="password"
            placeholder="Crie uma senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-green-700 text-white font-semibold hover:bg-green-800 transition"
          >
            {loading ? "Criando..." : "Cadastrar"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Já tem conta?{" "}
          <a href="/login" className="text-green-700 hover:underline font-medium">
            Entrar
          </a>
        </div>
      </div>
    </div>
  );
}
