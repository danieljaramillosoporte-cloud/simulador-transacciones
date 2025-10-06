import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { curp: string } }) {
  const user = await prisma.user.findUnique({
    where: { curp: params.curp },
    include: { transactions: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user); // 👈 aquí ya viene legalDocumentUrl
}
