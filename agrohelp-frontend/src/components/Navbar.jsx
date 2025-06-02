"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItemClass = (href) =>
    `px-3 py-1 rounded ${
      pathname === href
        ? "bg-green-800 text-white"
        : "text-green-100 hover:bg-green-700"
    }`;

  return (
    <nav className="bg-green-600 text-white px-4 py-3 flex justify-between items-center shadow">
        <Image src="/logo.png" alt="AgroHelp Logo" width={80} height={120} />

      <div className="flex gap-3 items-center text-sm">
        {user ? (
          <>
            <Link href="/upload" className={navItemClass("/upload")}>
              Upload
            </Link>
            <Link href="/dashboard" className={navItemClass("/dashboard")}>
              Dashboard
            </Link>
            <Link href="/call" className={navItemClass("/call")}>
              Call
            </Link>
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1 rounded bg-white text-green-700 hover:bg-gray-100"
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={navItemClass("/login")}>
              Login
            </Link>
            <Link href="/signup" className={navItemClass("/signup")}>
              Cadastro
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
