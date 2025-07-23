import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/auth-middleware"

const PROTECTED_PATHS = ["/admin"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Permitir acesso livre à tela de login
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }
  console.log("Cookies recebidos:", request.cookies.getAll())
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get("adminToken")?.value || request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token || !(await verifyAuthToken(token))) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"]
} 