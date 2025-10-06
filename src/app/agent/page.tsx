"use client";
import { useState } from "react";

export default function AgentDashboard() {
  const [form, setForm] = useState({
    name: "",
    curp: "",
    email: "",
    country: "",
    reference: "",
    code: "",
    amount: 0,
    totalAmount: 10000,
    legalDocumentFile: null as File | null, // 👈 aquí guardamos el PDF
  });

  // ✅ Crear usuario con PDF
  const createUser = async () => {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("curp", form.curp);
    formData.append("email", form.email);
    formData.append("country", form.country);
    formData.append("totalAmount", String(form.totalAmount));

    if (form.legalDocumentFile) {
      formData.append("legalDocument", form.legalDocumentFile); // 👈 PDF al backend
    }

    await fetch("/api/user", {
      method: "POST",
      body: formData, // 👈 no usamos JSON.stringify
    });

    alert("Usuario creado ✅");
  };

  // ✅ Crear transacción
  const createTransaction = async () => {
    const res = await fetch(`/api/user/${form.curp}`);
    const user = await res.json();
    if (user.error) return alert("Usuario no encontrado");

    await fetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        reference: form.reference,
        code: form.code,
        amount: form.amount,
        userId: user.id,
      }),
      headers: { "Content-Type": "application/json" },
    });
    alert("Transacción agregada ✅");
  };

  return (
    <div className="p-8 max-w-md mx-auto box">
      <h1 className="text-xl font-bold mb-4">Panel de Agente</h1>

      <h2 className="font-bold mt-6">Crear Usuario</h2>
      <input
        className="input mb-2"
        placeholder="Nombre"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="input mb-2"
        placeholder="CURP"
        value={form.curp}
        onChange={(e) => setForm({ ...form, curp: e.target.value })}
      />
      <input
        className="input mb-2"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="input mb-2"
        placeholder="País"
        value={form.country}
        onChange={(e) => setForm({ ...form, country: e.target.value })}
      />
      <input
        className="input mb-2"
        type="number"
        placeholder="Total Amount"
        value={form.totalAmount}
        onChange={(e) =>
          setForm({ ...form, totalAmount: Number(e.target.value) })
        }
      />

      {/* 👇 Input para PDF */}
      <input
        type="file"
        accept="application/pdf"
        className="input mb-2"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setForm({ ...form, legalDocumentFile: file });
          }
        }}
      />

      <button onClick={createUser} className="button mt-2">
        Crear Usuario
      </button>

      <h2 className="font-bold mt-6">Insertar Transacción</h2>
      <input
        className="input mb-2"
        placeholder="Reference"
        value={form.reference}
        onChange={(e) => setForm({ ...form, reference: e.target.value })}
      />
      <input
        className="input mb-2"
        placeholder="Code"
        value={form.code}
        onChange={(e) => setForm({ ...form, code: e.target.value })}
      />
      <input
        className="input mb-2"
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
      />

      <button onClick={createTransaction} className="button mt-2">
        Agregar Transacción
      </button>
    </div>
  );
}
