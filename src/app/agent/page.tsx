"use client";
import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  curp: string;
  email?: string;
  country?: string;
}

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
  date: "", // 👈 nuevo campo manual
  legalDocumentFile: null as File | null,
});
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ✅ Cargar usuarios existentes
  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  // ✅ Crear usuario
  const createUser = async () => {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("curp", form.curp);
    formData.append("email", form.email);
    formData.append("country", form.country);
    formData.append("totalAmount", String(form.totalAmount));

    if (form.legalDocumentFile) {
      formData.append("legalDocument", form.legalDocumentFile);
    }

    const res = await fetch("/api/user", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert("Usuario creado ✅");
      setUsers(prev => [...prev, data]); // actualizar lista de usuarios
      setForm(prev => ({ ...prev, name: "", curp: "", email: "", country: "", legalDocumentFile: null }));
    } else {
      alert(data.error || "Error creando usuario");
    }
  };

  // ✅ Insertar transacción
  const createTransaction = async () => {
    if (!form.curp) return alert("Ingresa la CURP del usuario");

    const resUser = await fetch(`/api/user/${form.curp}`);
    const user = await resUser.json();
    if (user.error) return alert("Usuario no encontrado");

    const resTx = await fetch("/api/transactions", {
  method: "POST",
  body: JSON.stringify({
    reference: form.reference,
    code: form.code,
    amount: form.amount,
    userId: user.id,
    date: form.date ? new Date(form.date).toISOString() : null, // 👈 convertir al formato ISO
  }),
  headers: { "Content-Type": "application/json" },
});

    const txData = await resTx.json();
    if (resTx.ok) alert("Transacción agregada ✅");
    else alert(txData.error || "Error agregando transacción");
  };

  // ✅ Subir documento legal usando select de usuarios
  const uploadLegalDocument = async () => {
    if (!selectedUser) return alert("Selecciona un usuario");
    if (!form.legalDocumentFile) return alert("Selecciona un PDF primero");

    const formData = new FormData();
    formData.append("curp", selectedUser.curp);
    formData.append("legalDocument", form.legalDocumentFile);

    const res = await fetch("/api/user", {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Documento agregado a ${selectedUser.name} ✅`);
      setForm(prev => ({ ...prev, legalDocumentFile: null }));
    } else {
      alert(data.error || "Error subiendo documento");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto box">
      <h1 className="text-xl font-bold mb-4">Panel de Agente</h1>

      {/* Crear Usuario */}
      <h2 className="font-bold mt-6">Crear Usuario</h2>
      <input className="input mb-2" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="input mb-2" placeholder="CURP" value={form.curp} onChange={(e) => setForm({ ...form, curp: e.target.value })} />
      <input className="input mb-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="input mb-2" placeholder="País" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
      <input className="input mb-2" type="number" placeholder="Total Amount" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: Number(e.target.value) })} />
      <input type="file" accept="application/pdf" className="input mb-2" onChange={(e) => { const file = e.target.files?.[0]; if (file) setForm({ ...form, legalDocumentFile: file }); }} />
      <button onClick={createUser} className="button mt-2">Crear Usuario</button>

      {/* Insertar Transacción */}
      <h2 className="font-bold mt-6">Insertar Transacción</h2>
      <input className="input mb-2" placeholder="CURP del usuario" value={form.curp} onChange={(e) => setForm({ ...form, curp: e.target.value })} />
      <input className="input mb-2" placeholder="Reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
      <input className="input mb-2" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
      <input
  className="input mb-2"
  type="datetime-local"
  value={form.date}
  onChange={(e) => setForm({ ...form, date: e.target.value })}
/>
      <input className="input mb-2" type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
      <button onClick={createTransaction} className="button mt-2">Agregar Transacción</button>

      {/* Subir Documento Legal */}
      <h2 className="font-bold mt-6">Agregar Documento Legal</h2>
      <select className="input mb-2" value={selectedUser?.id ?? ""} onChange={(e) => {
        const user = users.find(u => u.id === Number(e.target.value));
        setSelectedUser(user ?? null);
      }}>
        <option value="">-- Selecciona un usuario --</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.curp})</option>)}
      </select>
      <input type="file" accept="application/pdf" className="input mb-2" onChange={(e) => { const file = e.target.files?.[0]; if (file) setForm({ ...form, legalDocumentFile: file }); }} />
      <button onClick={uploadLegalDocument} className="button mt-2">Subir Documento</button>
    </div>
  );
}
