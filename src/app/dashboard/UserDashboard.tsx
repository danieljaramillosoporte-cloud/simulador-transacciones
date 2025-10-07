"use client";

import { useState, useEffect } from "react";
import Typewriter from "typewriter-effect";

interface Transaction {
  reference: string;
  code: string;
  id: string;
  amount: number;
}

interface User {
  id: number;
  name: string;
  curp: string;
  email?: string;
  country?: string;
  totalAmount?: number;
  legalDocumentUrl?: string;
}

export default function UserDashboard({ curp }: { curp: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [typedTransaction, setTypedTransaction] = useState({
    reference: "",
    code: "",
    id: "",
    amount: "",
  });
  const [accumulated, setAccumulated] = useState(0);
  const [finishedBoxes, setFinishedBoxes] = useState(false);
  const [finishedTransactions, setFinishedTransactions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [numTransactions, setNumTransactions] = useState<number | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [showVerifyButton, setShowVerifyButton] = useState(false);

  const openDocModal = () => setIsDocModalOpen(true);
  const closeDocModal = () => setIsDocModalOpen(false);
  const openModal = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setRecoveryCode(code);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    fetch(`/api/user/${curp}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setUser(data);
      });
  }, [curp]);

  const TOTAL_AMOUNT = user?.totalAmount ?? 10000;
  const MIN_TX = 100;
  const MAX_TX = 20000;
  const MIN_NUM_TX = 15;
  const MAX_NUM_TX = 25;

  const calcNumTransactions = () => {
    const minTxs = Math.ceil(TOTAL_AMOUNT / MAX_TX);
    const maxTxs = Math.floor(TOTAL_AMOUNT / MIN_TX);
    return Math.min(
      MAX_NUM_TX,
      Math.max(MIN_NUM_TX, minTxs + Math.floor(Math.random() * (maxTxs - minTxs + 1)))
    );
  };

  const generateTransactionAmounts = (numTxs: number) => {
    const randNums: number[] = Array.from({ length: numTxs }, () => Math.random());
    const sum = randNums.reduce((a, b) => a + b, 0);
    const amounts = randNums.map((n) => Math.max(MIN_TX, Math.round((n / sum) * TOTAL_AMOUNT)));
    const diff = TOTAL_AMOUNT - amounts.reduce((a, b) => a + b, 0);
    amounts[amounts.length - 1] += diff;
    return amounts;
  };

  const typeField = async (field: keyof typeof typedTransaction, value: string) => {
    for (let i = 0; i <= value.length; i++) {
      setTypedTransaction((prev) => ({
        ...prev,
        [field]: value.slice(0, i),
      }));
      await new Promise((res) => setTimeout(res, 50));
    }
  };

  useEffect(() => {
  if (!user || !finishedBoxes) return;

  const fetchTransactions = async () => {
    try {
      // 1️⃣ Traer transacciones reales
      const res = await fetch(`/api/transactions?curp=${user.curp}`);
      const data: Transaction[] = await res.json();

      if (data.length > 0) {
        // ✅ Si existen transacciones reales
        setTransactions(data);
        const total = data.reduce((sum, tx) => sum + tx.amount, 0);
        setAccumulated(total);
        setFinishedTransactions(true);
        setShowVerifyButton(true);
      } else {
        // ⚡ No hay transacciones, generar aleatorias
        const TOTAL_AMOUNT = user.totalAmount ?? 10000;
        const MIN_TX = 100;
        const MAX_TX = 20000;
        const MIN_NUM_TX = 15;
        const MAX_NUM_TX = 25;

        const numTxs = Math.min(
          MAX_NUM_TX,
          Math.max(
            MIN_NUM_TX,
            Math.ceil(TOTAL_AMOUNT / MAX_TX) +
              Math.floor(Math.random() * (Math.floor(TOTAL_AMOUNT / MIN_TX) - Math.ceil(TOTAL_AMOUNT / MAX_TX) + 1))
          )
        );

        const randNums: number[] = Array.from({ length: numTxs }, () => Math.random());
        const sum = randNums.reduce((a, b) => a + b, 0);
        const amounts = randNums.map((n) => Math.max(MIN_TX, Math.round((n / sum) * TOTAL_AMOUNT)));
        const diff = TOTAL_AMOUNT - amounts.reduce((a, b) => a + b, 0);
        amounts[amounts.length - 1] += diff;

        // Animación Typewriter
        let i = 0;
        const generateNext = async () => {
          if (i >= amounts.length) {
            setFinishedTransactions(true);
            setTimeout(() => setShowVerifyButton(true), 1000);
            return;
          }

          const amount = amounts[i];
          const newTx: Transaction = {
            reference: Math.random().toString(36).substring(2, 8).toUpperCase(),
            code: Math.random().toString(36).substring(2, 6).toUpperCase(),
            id: Math.random().toString(36).substring(2, 10),
            amount,
          };

          setCurrentTransaction(newTx);
          setTypedTransaction({ reference: "", code: "", id: "", amount: "" });

          await typeField("reference", newTx.reference);
          await typeField("code", newTx.code);
          await typeField("id", newTx.id);
          await typeField("amount", "$" + newTx.amount.toLocaleString());

          setTransactions((prev) => [...prev, newTx]);
          setAccumulated((prev) => prev + amount);

          i++;
          generateNext();
        };

        generateNext();
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  fetchTransactions();
}, [user, finishedBoxes]);
  if (!user) {
    return <div className="p-8 text-center text-lg">Cargando información del cliente...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto flex gap-4 mb-6">
        {/* Primer cuadro */}
        <div className="flex-1 box flex flex-col justify-between">
          <div className="border-b border-white/20 pb-2 mb-2">
            <Typewriter
              onInit={(tw) => {
                tw.typeString("Federal Trade Commission<br/>Protecting consumers")
                  .pauseFor(500)
                  .start();
              }}
              options={{ delay: 50, cursor: "▋" }}
            />
          </div>

          <div>
            <Typewriter
              onInit={(tw) => {
                tw.typeString("Establishing secure connection...")
                  .pauseFor(800)
                  .deleteAll()
                  .typeString("Verifying identity...")
                  .pauseFor(800)
                  .deleteAll()
                  .typeString("Secure channel established ")
                  .pauseFor(1000)
                  .deleteAll()
                  .typeString(`Nombre: ${user?.name ?? "N/A"}<br/>CURP: ${user?.curp ?? "N/A"}`)
                  .callFunction(() => setFinishedBoxes(true))
                  .start();
              }}
              options={{ delay: 45, cursor: "▋" }}
            />
          </div>
        </div>

        {/* Segundo cuadro */}
        <div className="flex-1 box flex flex-col justify-between">
          <div className="border-b border-white/20 pb-2 mb-2">
            <Typewriter
              onInit={(tw) => tw.typeString("Start Capital Recovery Process").start()}
              options={{ delay: 50, cursor: "▋" }}
            />
          </div>

          {/* 👇 Botones solo aparecen al final */}
          {finishedTransactions && (
            <div className="flex flex-col items-center gap-3 animate-fadeIn">
              <button
                onClick={openModal}
                className="px-6 py-2 border border-white rounded-md bg-white/10 hover:bg-white/20 transition-all shadow-md"
              >
                Start Capital Recovery Process
              </button>

              {user?.legalDocumentUrl && showVerifyButton && (
                <button
                  onClick={openDocModal}
                  className="px-6 py-2 border border-white rounded-md bg-white/10 hover:bg-white/20 transition-all shadow-md animate-fadeInDelay"
                >
                  Verify Identity
                </button>
              )}
            </div>
          )}
        </div>

    {/* 🔹 Tercer cuadro compacto con animación Typewriter y estados dinámicos REALES */}
<div className="flex-1 box flex flex-col justify-between text-sm leading-tight text-white">
  {/* 🔸 Encabezado con Typewriter */}
  <div className="border-b border-white/20 pb-2 mb-2">
    <Typewriter
      onInit={(tw) => {
        tw.typeString('Trace Status: ')
          .typeString('<span class="trace-status text-yellow-400 font-bold">In Progress...</span>')
          .pauseFor(600)
          .typeString('<br/>Platform: Connected to database')
          .pauseFor(600)
          .typeString('<br/>Recoverable Capital: ')
          .typeString('<span class="recoverable-status text-yellow-400 font-bold">Pending...</span>')
          .start();
      }}
      options={{ delay: 40, cursor: "▋" }}
    />
  </div>

  {/* 🔸 Access & Email con animación Typewriter */}
  <div>
    <Typewriter
      onInit={(tw) => {
        tw.typeString("Establishing secure connection...")
          .pauseFor(700)
          .deleteAll()
          .typeString("Validating access credentials...")
          .pauseFor(700)
          .deleteAll()
          .typeString("Secure connection verified ")
          .pauseFor(700)
          .deleteAll()
          .typeString(`Access: ${user?.country ?? "N/A"}<br/>Email: ${user?.email ?? "N/A"}`)
          .start();
      }}
      options={{ delay: 40, cursor: "▋" }}
    />
  </div>
</div>
</div>

      {/* Transacciones */}
      {finishedBoxes && (
        <div className="max-w-6xl mx-auto box">
          <div className="mb-2 font-bold">Listado de transacciones rastreadas</div>

          <div className="grid grid-cols-4 gap-4 font-bold py-1 border-b border-white/30">
            <div>REFERENCE</div>
            <div>CODE</div>
            <div>ID</div>
            <div>AMOUNT</div>
          </div>

          <div className="mt-2">
            {transactions.map((tx, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-4 gap-4 font-mono py-1 border border-white/10 rounded-sm ${
                  idx % 2 === 0 ? "bg-white/5" : "bg-transparent"
                }`}
              >
                <div>{tx.reference}</div>
                <div>{tx.code}</div>
                <div>{tx.id}</div>
                <div>{tx.amount.toLocaleString()}</div>
              </div>
            ))}

            {currentTransaction && (
              <div
                className={`grid grid-cols-4 gap-4 font-mono py-1 border border-white/10 rounded-sm ${
                  transactions.length % 2 === 0 ? "bg-white/5" : "bg-transparent"
                }`}
              >
                <div>{typedTransaction.reference}</div>
                <div>{typedTransaction.code}</div>
                <div>{typedTransaction.id}</div>
                <div>{typedTransaction.amount}</div>
              </div>
            )}
          </div>

          <div className="mt-4 font-bold text-right text-lg">
            Total: ${accumulated.toLocaleString()}
          </div>
        </div>
      )}

      {/* Modal Recovery */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="box relative max-w-sm w-full p-6 text-center">
            <h2 className="text-lg font-bold mb-4">Recovery Code</h2>
            <div className="text-2xl font-mono tracking-widest text-green-400 mb-6">
              {recoveryCode}
            </div>
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-white rounded-md bg-white/10 hover:bg-white/20 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal Documento */}
      {isDocModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="box relative max-w-3xl w-full h-[80vh] p-4 flex flex-col">
            <h2 className="text-lg font-bold mb-2">Legal Document</h2>
            <iframe
              src={user?.legalDocumentUrl ?? ""}
              className="flex-1 w-full border border-white/30 rounded-md"
            />
            <button
              onClick={closeDocModal}
              className="mt-4 px-4 py-2 border border-white rounded-md bg-white/10 hover:bg-white/20 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
