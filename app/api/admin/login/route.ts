import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const SECRET = process.env.ADMIN_SECRET || "admin-secret"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@admin.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, SECRET, { expiresIn: "1d" })
    return NextResponse.json({ token })
  }
  return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
} 