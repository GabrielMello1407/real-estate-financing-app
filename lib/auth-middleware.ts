import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET || "admin-secret")

export async function verifyAuthToken(token: string): Promise<any | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    console.log("Payload do token:", payload)
    return payload
  } catch (e) {
    console.error("Erro ao verificar token:", e)
    return null
  }
} 