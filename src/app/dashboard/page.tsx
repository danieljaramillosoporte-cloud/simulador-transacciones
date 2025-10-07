"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import UserDashboard from "./UserDashboard";

function DashboardInner() {
  const params = useSearchParams();
  const curp = params.get("curp");

  if (!curp) return <div className="p-8">❌ No se recibió CURP</div>;

  return <UserDashboard curp={curp} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando dashboard...</div>}>
      <DashboardInner />
    </Suspense>
  );
}
