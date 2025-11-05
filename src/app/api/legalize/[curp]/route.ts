import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { curp: string } }) {
  const { curp } = params;

  try {
    // Actualiza el campo `isLegalized` del usuario
    const user = await prisma.user.update({
      where: { curp },
      data: { isLegalized: true },
    });

    return NextResponse.json({
      success: true,
      message: `Usuario ${user.name} legalizado ✅`,
    });
    } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
