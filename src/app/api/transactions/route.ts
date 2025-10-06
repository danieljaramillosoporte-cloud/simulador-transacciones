import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const tx = await prisma.transaction.create({
    data: {
      reference: body.reference,
      code: body.code,
      amount: body.amount,
      legalized: body.legalized ?? false,
      userId: body.userId,
    },
  });
  return NextResponse.json(tx);
}
