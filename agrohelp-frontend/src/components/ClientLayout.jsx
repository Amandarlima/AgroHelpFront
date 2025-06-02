
"use client";

import Navbar from "./Navbar";

export default function ClientLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="pt-4">{children}</main>
    </>
  );
}
