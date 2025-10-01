"use client";

import { useState, useEffect } from "react";
import Typewriter from "typewriter-effect";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);

  const openModal = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setRecoveryCode(code);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const firstBoxLines = [
    "Federal Trade Commission",
    "Protecting consumers",
    "Nombre: GLORIA VAZQUEZ CRUZ",
    "ID: VACG850406MCSZRL08",
  ];
  const secondBoxLines = ["Process Options"];
  const thirdBoxLines = [
    "Traced capital: Yes",
    "Recoverable capital: Yes",
    "Email: alegriahdzdelacruz@gmail.com",
    "Trace Status: Complete",
    "Access: Mexico - Ciudad de Mexico - Chiapas",
    "Platform status: Connected to database",
  ];

  const fixedTransactions = [
  { reference: "DEP01", code: "C01", id: "ID001", amount: 38800 },
  { reference: "DEP02", code: "C02", id: "ID002", amount: 265300 },
  { reference: "DEP03", code: "C03", id: "ID003", amount: 26000 },
  { reference: "DEP04", code: "C04", id: "ID004", amount: 59000 },
  { reference: "DEP05", code: "C05", id: "ID005", amount: 50000 },
  { reference: "DEP06", code: "C06", id: "ID006", amount: 100000 },
  { reference: "DEP07", code: "C07", id: "ID007", amount: 10000 },
  { reference: "GAN01", code: "G01", id: "ID008", amount: 1548478.59 },
  { reference: "DEP08", code: "C08", id: "ID009", amount: 45200 },
  { reference: "DEP09", code: "C09", id: "ID010", amount: 45000 },
].map((tx, index, arr) => ({
  ...tx,
  legalized: index >= arr.length - 2 ? "Yes" : "No", // solo los dos últimos Yes
}));

  const TOTAL_AMOUNT = fixedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const [readyTransactions, setReadyTransactions] = useState(false);
  const [transactions, setTransactions] = useState<
  { reference: string; code: string; id: string; amount: number; legalized: string }[]
>([]);
  const [currentTransaction, setCurrentTransaction] = useState<{
  reference: string;
  code: string;
  id: string;
  amount: number;
  legalized: string;
} | null>(null);
  const [accumulated, setAccumulated] = useState(0);

  // Animación de transacciones fijas
  useEffect(() => {
    if (!readyTransactions) return;
    if (transactions.length >= fixedTransactions.length) return;

    const nextTx = fixedTransactions[transactions.length];
    setCurrentTransaction(nextTx);

    const timeout = setTimeout(() => {
      setTransactions((prev) => [...prev, nextTx]);
      setAccumulated((prev) => prev + nextTx.amount);
      setCurrentTransaction(null);
    }, 300);

    return () => clearTimeout(timeout);
  }, [transactions, readyTransactions]);

  const renderTypewriter = (lines: string[], onComplete?: () => void) => (
    <Typewriter
      onInit={(tw) => {
        lines.forEach((line, i) => {
          tw.typeString(line).pauseFor(500);
          if (i < lines.length - 1) tw.typeString("<br/>");
        });
        if (onComplete) tw.callFunction(onComplete);
        tw.start();
      }}
      options={{
        delay: 50,
        loop: false,
        cursor: "▋",
      }}
    />
  );

  return (
  <div className="min-h-screen p-4 md:p-8">
    {/* Boxes principales */}
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 box p-4 md:p-6 text-sm md:text-base">
        {renderTypewriter(firstBoxLines)}
      </div>
      <div className="flex-1 box p-4 md:p-6 text-sm md:text-base">
        {renderTypewriter(secondBoxLines)}
        {accumulated >= TOTAL_AMOUNT && (
          <button onClick={openModal} className="mt-4 w-full md:w-auto px-4 py-2 border border-white rounded-md bg-white/10 hover:bg-white/20 transition-all shadow-md">
            Start Capital Recovery Process
          </button>
        )}
      </div>
      <div className="flex-1 box p-4 md:p-6 text-sm md:text-base">
        {renderTypewriter(thirdBoxLines, () => setReadyTransactions(true))}
      </div>
    </div>

    {/* Listado de transacciones */}
    {readyTransactions && (
      <div className="max-w-6xl mx-auto box p-4 md:p-6">
        <div className="mb-2 font-bold">Listado de transacciones rastreadas</div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 font-bold border-b border-slate-400 pb-1">
          <div>REFERENCE</div>
          <div>CODE</div>
          <div>ID</div>
          <div>AMOUNT</div>
          <div>LEGALIZED</div>
        </div>

        <div className="mt-2">
          {transactions.map((tx, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div>{tx.reference}</div>
              <div>{tx.code}</div>
              <div>{tx.id}</div>
              <div>${tx.amount.toLocaleString()}</div>
              <div>{tx.legalized}</div>
            </div>
          ))}

          {currentTransaction && (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div>{currentTransaction.reference}</div>
              <div>{currentTransaction.code}</div>
              <div>{currentTransaction.id}</div>
              <div>${currentTransaction.amount.toLocaleString()}</div>
              <div>{currentTransaction.legalized}</div>
            </div>
          )}
        </div>

        {accumulated >= TOTAL_AMOUNT && (
          <div className="mt-4 font-bold text-right">
            Total: ${accumulated.toLocaleString()}
          </div>
        )}
      </div>
    )}

    {/* Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
        <div className="box relative max-w-sm w-11/12 p-4 md:p-6 text-center">
          <h2 className="text-lg font-bold mb-4">Recovery Code</h2>
          <div className="text-2xl font-mono tracking-widest text-green-400 mb-6">
            {recoveryCode}
          </div>
          <button onClick={closeModal} className="px-4 py-2 border border-white rounded-md bg-white/10 hover:bg-white/20 transition-all">
            Close
          </button>
        </div>
      </div>
    )}
  </div>
);
} 

