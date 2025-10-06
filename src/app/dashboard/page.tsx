// app/dashboard/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import UserDashboard from "./UserDashboard.tsx";

export default function DashboardPage() {
  const params = useSearchParams();
  const curp = params.get("curp"); // lee ?curp=XXXX de la URL

  if (!curp) return <div className="p-8">❌ No se recibió CURP</div>;

  return <UserDashboard curp={curp} />;
}
