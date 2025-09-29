"use client";
import { useEffect, useState } from "react";

function TypewriterLine({
  text,
  speed = 50,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let index = 0;
    let timeoutId: NodeJS.Timeout | number;

    const typeNext = () => {
      if (index < text.length) {
        setDisplayed((prev) => prev + text[index]);
        index++;
        timeoutId = setTimeout(typeNext, speed);
      } else {
        onComplete?.();
      }
    };

    typeNext();

    return () => clearTimeout(timeoutId);
  }, [text, speed, onComplete]);

  return (
    <div>
      {displayed}
      <span className="animate-pulse">▋</span>
    </div>
  );
}

function TypewriterBlock({ lines, speed = 50 }: { lines: string[]; speed?: number }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);

  if (lines.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {/* Líneas completadas */}
      {completedLines.map((line, idx) => (
        <div key={idx}>{line}</div>
      ))}

      {/* Línea actual */}
      {currentLine < lines.length && (
        <TypewriterLine
          text={lines[currentLine]}
          speed={speed}
          onComplete={() => {
            setCompletedLines((prev) => [...prev, lines[currentLine]]);
            setCurrentLine((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}

// Uso en la página
export default function BalancePage() {
  const headerLines = [
    "Federal Trade Commission",
    "Protecting consumers",
    "Nombre: Julio Ariel Carranza Bello",
    "ID: CABJ541016HDFRLL01",
  ];

  const statusLines = [
    "Traced capital: Yes",
    "Recoverable capital: Yes",
    "Trace Status: Complete",
    "Email: elcaguamo45881@gmail.com",
    "Access: La Paz - Baja California Sur - Mexico - 23089",
    "Platform status: Connected to database",
  ];
  const balanceLines = ["Total: $17.800"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-green-400 font-mono p-8">
      <div className="max-w-6xl mx-auto border border-green-500 rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.4)] p-6">
        {/* Encabezado */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
          <div>
            <TypewriterBlock lines={headerLines} speed={60} />
          </div>

          <div>
            <TypewriterBlock lines={optionsLines} speed={60} />
          </div>

          <div className="text-right">
            <TypewriterBlock lines={statusLines} speed={60} />
          </div>
        </div>

        {/* Balance */}
        <div className="border-t border-green-500 pt-6 mt-6 text-xl md:text-2xl font-bold flex justify-end">
          <TypewriterBlock lines={balanceLines} speed={100} />
        </div>
      </div>
    </div>
  );
}
