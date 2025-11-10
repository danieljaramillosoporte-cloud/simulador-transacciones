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

// ✅ PUT → “Volver Balance 0”
export async function PUT(req: Request, context: { params: Promise<{ curp: string }> }) {
  const { curp } = await context.params;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    const data = await req.json();
    if (data.totalAmount === undefined) {
      return NextResponse.json({ error: "Missing totalAmount" }, { status: 400 });
    }

    // 🔎 Buscar usuario actual
    const existingUser = await prisma.user.findUnique({ where: { curp } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const previousAmount = existingUser.totalAmount ?? 0;

    // 🧾 Si tenía saldo antes, registrar la transacción negativa
    if (previousAmount > 0) {
      await prisma.transaction.create({
        data: {
          reference: `RESET-${Date.now()}`,
          code: "RESET",
          amount: -previousAmount, // monto negativo igual al saldo anterior
          legalized: true,
          userId: existingUser.id,
          date: new Date(),
        },
      });
    }

    // 🔧 Actualizar balance a 0
    const resetUser = await prisma.user.update({
      where: { curp },
      data: { totalAmount: 0 },
      include: { transactions: true },
    });

    return NextResponse.json(resetUser);
  } catch (error) {
    console.error("❌ Error actualizando usuario:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
