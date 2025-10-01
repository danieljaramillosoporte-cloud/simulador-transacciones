"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const typeWriter = async (text: string, speed = 50) => {
    for (let i = 0; i < text.length; i++) {
      setOutput((prev) => prev + text[i]);
      await new Promise((r) => setTimeout(r, speed));
    }
  };

  const animatedDots = async (times = 5, speed = 300) => {
    for (let i = 0; i < times; i++) {
      setOutput((prev) => prev + ".");
      await new Promise((r) => setTimeout(r, speed));
    }
    setOutput((prev) => prev + "\n");
  };

  const handleLogin = async () => {
    if (!userId.trim()) return alert("Ingresa un ID de usuario");
    setOutput("");
    setLoading(true);

    await typeWriter(`Buscando usuario con ID: ${userId}`);
    await animatedDots();

    await typeWriter("Buscando transacciones");
    await animatedDots(5, 200);

    await typeWriter("Generando información");
    await animatedDots(5, 150);

    router.replace(`/dashboard?userId=${userId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
  <div className="box flex flex-col items-center w-full max-w-sm">
    <input
      type="text"
      placeholder="Ingresa tu ID de usuario"
      value={userId}
      onChange={(e) => setUserId(e.target.value)}
      className="input"
      disabled={loading}
    />
    <button
      onClick={handleLogin}
      className="button mt-4"
      disabled={loading}
    >
      Ingresar
    </button>
    <pre className="output">{output}</pre>
  </div>
</div>
  );
}
