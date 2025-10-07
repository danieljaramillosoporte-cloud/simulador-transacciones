import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, context: { params: Promise<{ curp: string }> }) {
  const { curp } = await context.params; // 👈 cambia esto

  const user = await prisma.user.findUnique({
    where: { curp },
    include: { transactions: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
