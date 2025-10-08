// src/app/api/user/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();
const UPLOADS_DIR = "/mnt/disks/data/uploads";

// 📘 GET: Obtener usuarios o archivo PDF
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fileName = url.searchParams.get("file");

    // Si se solicita un archivo PDF
    if (fileName) {
      const filePath = path.join(UPLOADS_DIR, fileName);
      try {
        const file = await readFile(filePath);
        const uint8Array = new Uint8Array(file);
        return new NextResponse(uint8Array, {
          headers: { "Content-Type": "application/pdf" },
        });
      } catch {
        return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
      }
    }

    // Si no, retornar usuarios
    const users = await prisma.user.findMany({
      select: { id: true, name: true, curp: true, email: true, country: true, legalDocumentUrl: true },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("❌ Error en GET /api/user:", error);
    return NextResponse.json({ error: "Error cargando usuarios" }, { status: 500 });
  }
}

// ✳️ POST: Crear nuevo usuario
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, curp, email, country } = data;

    if (!name || !curp)
      return NextResponse.json({ error: "Faltan campos obligatorios (name, curp)" }, { status: 400 });

    // Verificar si ya existe
    const existing = await prisma.user.findUnique({ where: { curp } });
    if (existing)
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 });

    const newUser = await prisma.user.create({
      data: { name, curp, email, country },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("❌ Error creando usuario:", error);
    return NextResponse.json({ error: "Error creando usuario" }, { status: 500 });
  }
}

// 📤 PUT: Subir documento y actualizar usuario
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const curp = formData.get("curp") as string;
    const file = formData.get("legalDocument");

    if (!curp) return NextResponse.json({ error: "CURP requerida" }, { status: 400 });
    if (!file || !(file instanceof File)) return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { curp } });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    await mkdir(UPLOADS_DIR, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${curp}-${Date.now()}.pdf`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    await writeFile(filePath, buffer);

    const updatedUser = await prisma.user.update({
      where: { curp },
      data: { legalDocumentUrl: fileName },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("❌ Error subiendo documento:", error);
    return NextResponse.json({ error: "Error subiendo documento" }, { status: 500 });
  }
}
