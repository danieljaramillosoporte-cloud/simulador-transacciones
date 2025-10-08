import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Transaction } from "@prisma/client";

const prisma = new PrismaClient();

// Tipo para la respuesta de transacciones sin exponer userId
type TransactionResponse = Omit<Transaction, "userId">;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const curp = url.searchParams.get("curp");

    if (!curp) {
      return NextResponse.json({ error: "CURP is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { curp },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Traemos transacciones del usuario
    const transactions: TransactionResponse[] = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reference: true,
        code: true,
        amount: true,
        legalized: true,
        createdAt: true,
      },
    });

    return NextResponse.json(transactions);
  } catch (error: unknown) {
    console.error(
      "Error fetching transactions:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: {
      reference?: string;
      code?: string;
      amount?: number;
      legalized?: boolean;
      userId?: number;
    } = await req.json();

    if (!body.reference || !body.code || !body.amount || !body.userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tx: Transaction = await prisma.transaction.create({
      data: {
        reference: body.reference,
        code: body.code,
        amount: body.amount,
        legalized: body.legalized ?? false,
        userId: body.userId,
      },
    });

    return NextResponse.json(tx);
  } catch (error: unknown) {
    console.error(
      "Error creating transaction:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
