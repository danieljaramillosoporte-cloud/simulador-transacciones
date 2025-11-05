"use client";

import { useState, useEffect, useCallback } from "react";
import Typewriter from "typewriter-effect";

interface Transaction {
  reference: string;
  code: string;
  amount: number;
  legalized?: boolean;
  date?: string | null; 
}

interface User {
  id: number;
  name: string;
  curp: string;
  email?: string;
  country?: string;
  totalAmount?: number;
  legalDocumentUrl?: string;
  isLegalized?: boolean; // ✅ Nuevo campo
}

export default function UserDashboard({ curp }: { curp: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [typedTransaction, setTypedTransaction] = useState({
    reference: "",
    code: "",
    date: "",
    amount: "",
  });
  const [accumulated, setAccumulated] = useState(0);
  const [finishedBoxes, setFinishedBoxes] = useState(false);
  const [finishedTransactions, setFinishedTransactions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [showVerifyButton, setShowVerifyButton] = useState(false);

  // Estados dinámicos para Trace y Recoverable
  const [traceStatus, setTraceStatus] = useState("In Progress...");
  const [recoverableCapital, setRecoverableCapital] = useState("Pending...");
  const [traceStatusColor, setTraceStatusColor] = useState("text-yellow-400");
  const [recoverableCapitalColor, setRecoverableCapitalColor] = useState("text-yellow-400");

  const openDocModal = () => setIsDocModalOpen(true);
  const closeDocModal = () => setIsDocModalOpen(false);
  const openModal = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setRecoveryCode(code);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const typeField = useCallback(
    async (field: keyof typeof typedTransaction, value: string) => {
      for (let i = 0; i <= value.length; i++) {
        setTypedTransaction((prev) => ({
          ...prev,
          [field]: value.slice(0, i),
        }));
        await new Promise((res) => setTimeout(res, 50));
      }
    },
    []
  );

  useEffect(() => {
    fetch(`/api/user/${curp}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setUser(data);
      });
  }, [curp]);

  useEffect(() => {
    if (!user || !finishedBoxes) return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/transactions?curp=${user.curp}`);
        const data: Transaction[] = await res.json();

        let txs: Transaction[] = [];

        if (data.length > 0) {
          txs = data; // transacciones reales
        } else {
          // Generar transacciones aleatorias si no hay reales
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
                Math.floor(
                  Math.random() *
                    (Math.floor(TOTAL_AMOUNT / MIN_TX) -
                      Math.ceil(TOTAL_AMOUNT / MAX_TX) +
                      1)
                )
            )
          );

          const randNums: number[] = Array.from({ length: numTxs }, () => Math.random());
          const sum = randNums.reduce((a, b) => a + b, 0);
          const amounts = randNums.map((n) => Math.max(MIN_TX, Math.round((n / sum) * TOTAL_AMOUNT)));
          const diff = TOTAL_AMOUNT - amounts.reduce((a, b) => a + b, 0);
          amounts[amounts.length - 1] += diff;

          txs = amounts.map((amount) => ({
            reference: Math.random().toString(36).substring(2, 8).toUpperCase(),
            code: Math.random().toString(36).substring(2, 6).toUpperCase(),
            id: Math.random().toString(36).substring(2, 10),
            amount,
          }));
        }

        // Función recursiva para animar cada transacción
        let i = 0;
        const typeNext = async () => {
          if (i >= txs.length) {
            setFinishedTransactions(true);
            setShowVerifyButton(true);
            return;
          }

          const tx = txs[i];
          setCurrentTransaction(tx);
          setTypedTransaction({ reference: "", code: "", date: "", amount: "" });

          await typeField("reference", tx.reference);
          await typeField("code", tx.code);
          await typeField("date", formatDate(tx.date));
          await typeField("amount", "$" + tx.amount.toLocaleString());

          setTransactions((prev) => [...prev, tx]);
          setAccumulated((prev) => prev + tx.amount);

          i++;
          typeNext();
        };

        typeNext();
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [user, finishedBoxes, typeField]);

  const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


  // Actualizar estados y colores cuando terminen transacciones
  useEffect(() => {
    if (finishedTransactions) {
      const timer = setTimeout(() => {
        setTraceStatus("Complete");
        setRecoverableCapital("Yes");
        setTraceStatusColor("text-green-400");
        setRecoverableCapitalColor("text-green-400");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [finishedTransactions]);

  if (!user) {
    return <div className="p-8 text-center text-lg">Cargando información del usuario...</div>;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 text-sm sm:text-base leading-relaxed">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 mb-6">
        {/* Primer cuadro */}
        <div className="flex-1 box flex flex-col justify-between text-sm sm:text-base">
          <div className="border-b border-white/20 pb-2 mb-2 text-center md:text-left">
            <Typewriter
              onInit={(tw) => {
                tw.typeString("Federal Trade Commission<br/>Protecting consumers")
                  .pauseFor(500)
                  .start();
              }}
              options={{ delay: 50, cursor: "▋" }}
            />
          </div>

          <div className="text-center md:text-left">
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
<div className="flex-1 box flex flex-col justify-between text-center md:text-left">
  <div className="border-b border-white/20 pb-2 mb-2">
    <Typewriter
      onInit={(tw) => tw.typeString("Start Capital Recovery Process").start()}
      options={{ delay: 50, cursor: "▋" }}
    />
  </div>

  {finishedTransactions && (
    <div className="flex flex-col items-center md:items-start gap-3 animate-fadeIn">
      <button
        onClick={openModal}
        className="px-5 py-2 w-full sm:w-auto border border-white rounded-md bg-white/10 hover:bg-white/20 transition-all shadow-md"
      >
        Start Capital Recovery Process
      </button>

      {user?.legalDocumentUrl && showVerifyButton && (
        <button
          onClick={openDocModal}
          className="px-5 py-2 w-full sm:w-auto border border-white rounded-md bg-white/10 hover:bg-white/20 transition-all shadow-md animate-fadeInDelay"
        >
          Verify Identity
        </button>
      )}

      <div className="mt-4 text-sm text-gray-300 text-center md:text-left leading-tight">
        <p className="font-semibold">Delegado Fiduciario</p>
      </div>
    </div>
  )}
</div>

        {/* Tercer cuadro */}
        <div className="flex-1 box flex flex-col justify-between text-sm leading-tight text-white">
          <div className="border-b border-white/20 pb-2 mb-2 text-center md:text-left">
            Trace Status: <span className={`${traceStatusColor} font-bold`}>{traceStatus}</span>
            <br />
            Platform: Connected to database
            <br />
            Recoverable Capital:{" "}
            <span className={`${recoverableCapitalColor} font-bold`}>{recoverableCapital}</span>
          </div>

          <div className="text-center md:text-left">
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
        <div className="max-w-6xl mx-auto box overflow-x-auto">
          <div className="mb-2 font-bold">Listado de transacciones rastreadas</div>

          <div className="grid grid-cols-5 min-w-[600px] gap-4 font-bold py-1 border-b border-white/30">
  <div>REFERENCE</div>
  <div>CODE</div>
  <div>AMOUNT</div>
  <div>DATE</div>
  <div>LEGALIZED</div>
</div>

          <div className="mt-2">
            {transactions.map((tx, idx) => (
  <div
    key={idx}
    className={`grid grid-cols-5 min-w-[600px] gap-4 font-mono py-1 border border-white/10 rounded-sm ${
      idx % 2 === 0 ? "bg-white/5" : "bg-transparent"
    }`}
  >
    <div>{tx.reference}</div>
    <div>{tx.code}</div>
    <div>{tx.amount.toLocaleString()}</div>
    <div>{formatDate(tx.date)}</div>
    <div>{user.isLegalized ? "YES" : "NO"}</div>
  </div>
))}

            {currentTransaction && (
  <div
    className={`grid grid-cols-5 min-w-[600px] gap-4 font-mono py-1 border border-white/10 rounded-sm ${
      transactions.length % 2 === 0 ? "bg-white/5" : "bg-transparent"
    }`}
  >
    <div>{typedTransaction.reference}</div>
    <div>{typedTransaction.code}</div>
    <div>{typedTransaction.amount}</div>
    <div>—</div>
    <div>{user.isLegalized ? "YES" : "NO"}</div>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-2">
          <div className="box relative w-full max-w-[95%] sm:max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold mb-4">Recovery Code</h2>
            <div className="text-2xl font-mono tracking-widest text-green-400 mb-6">{recoveryCode}</div>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 px-2">
          <div className="box relative w-full max-w-[95%] sm:max-w-3xl h-[80vh] p-4 flex flex-col">
            <h2 className="text-lg font-bold mb-2">Legal Document</h2>
            <iframe
  src={user?.legalDocumentUrl ? `/api/user?file=${user.legalDocumentUrl}` : ""}
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
