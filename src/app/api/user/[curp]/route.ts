import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET → obtener usuario por CURP
export async function GET(req: Request, context: { params: Promise<{ curp: string }> }) {
  const { curp } = await context.params;

  const user = await prisma.user.findUnique({
    where: { curp },
    include: { transactions: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    curp: user.curp,
    email: user.email,
    country: user.country,
    totalAmount: user.totalAmount ?? 0,
    transactions: user.transactions,
  });
}

// ✅ PUT → actualizar balance (para “Volver Balance 0”)
export async function PUT(req: Request, context: { params: Promise<{ curp: string }> }) {
  const { curp } = await context.params;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await req.json();
      if (data.totalAmount === undefined)
        return NextResponse.json({ error: "Missing totalAmount" }, { status: 400 });

      // 🧾 Buscar balance anterior
      const existingUser = await prisma.user.findUnique({ where: { curp } });
      if (!existingUser)
        return NextResponse.json({ error: "User not found" }, { status: 404 });

      const previousAmount = existingUser.totalAmount ?? 0;

      // 🔧 Actualizar balance
      const updatedUser = await prisma.user.update({
        where: { curp },
        data: { totalAmount: data.totalAmount },
      });

      // 🧾 Registrar transacción automática solo si había saldo antes
      if (previousAmount > 0) {
        await prisma.transaction.create({
          data: {
            reference: `RESET-${Date.now()}`,
            code: "RESET",
            amount: -previousAmount, // se descuenta el saldo anterior
            legalized: true,
            userId: updatedUser.id,
            date: new Date(),
          },
        });
      }

      return NextResponse.json(updatedUser);
    }

    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  } catch (error) {
    console.error("❌ Error actualizando usuario:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
