import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const curp = formData.get("curp") as string;
    const email = formData.get("email") as string | null;
    const country = formData.get("country") as string | null;
    const totalAmount = Number(formData.get("totalAmount") || 10000);

    const file = formData.get("legalDocument") as File | null;

    let legalDocumentUrl: string | null = null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${curp}-${Date.now()}.pdf`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);

      await writeFile(filePath, buffer);
      legalDocumentUrl = `/uploads/${fileName}`;
    }

    const user = await prisma.user.create({
      data: {
        name,
        curp,
        email,
        country,
        totalAmount,
        legalDocumentUrl,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("❌ Error creando usuario:", error);
    return NextResponse.json({ error: "Error creando usuario" }, { status: 500 });
  }
}
