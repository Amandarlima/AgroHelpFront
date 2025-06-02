"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardPageContent from "./DashboardPageContent";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}
