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
    setOutput((prev) => prev + "<br/>");
  };

  const animatedDots = async (times = 5, speed = 300) => {
    for (let i = 0; i < times; i++) {
      setOutput((prev) => prev + ".");
      await new Promise((r) => setTimeout(r, speed));
    }
    setOutput((prev) => prev + "<br/>");
  };

  const handleLogin = async () => {
    const curp = userId.trim().toUpperCase();
    if (!curp) return alert("Ingresa tu CURP");

    setOutput("");
    setLoading(true);

    await typeWriter(`Buscando usuario con CURP: ${curp}`);
    await animatedDots();

    try {
      const res = await fetch(`/api/user/${curp}`);
      const user = await res.json();

      if (user.error) {
        await typeWriter("❌ Usuario no encontrado");
        setLoading(false);
        return;
      }

      // 👇 texto en verde con HTML inline
      await typeWriter('<span style="color: limegreen;"> Usuario encontrado</span>');
      await typeWriter("Generando información");
      await animatedDots(5, 150);

      router.replace(`/dashboard?curp=${user.curp}`);
    } catch (err) {
      await typeWriter("⚠️ Error de conexión con el servidor");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="box flex flex-col items-center w-full max-w-sm">
        <input
          type="text"
          placeholder="Ingresa tu CURP"
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

        {/* 👇 renderiza el texto como HTML */}
        <pre
          className="output"
          dangerouslySetInnerHTML={{ __html: output }}
        />
      </div>
    </div>
  );
}
