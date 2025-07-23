import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prismadb"
import { verifyAuthToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  // Buscar token no header Authorization ou cookie
  const authHeader = request.headers.get("authorization")
  let token = null
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.replace("Bearer ", "")
  } else {
    token = request.cookies.get("adminToken")?.value || null
  }

  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const proposals = await prisma.proposal.findMany({
      where: { status: "signed" },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(proposals)
  } catch (error) {
    console.error("Erro ao buscar propostas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const proposal = await prisma.proposal.create({ data })
    return NextResponse.json({ success: true, id: proposal.id })
  } catch (error) {
    console.error("Erro ao salvar proposta:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
