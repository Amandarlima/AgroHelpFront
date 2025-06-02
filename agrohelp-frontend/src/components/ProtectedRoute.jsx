"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session?.user) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  return <>{children}</>;
}
