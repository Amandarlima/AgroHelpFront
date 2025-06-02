"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import UploadPageContent from "./UploadPageContent";

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <UploadPageContent />
    </ProtectedRoute>
  );
}
